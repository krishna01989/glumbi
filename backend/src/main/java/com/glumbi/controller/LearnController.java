package com.glumbi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Activity;
import com.glumbi.repository.ActivityRepository;
import com.glumbi.repository.ChildRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.agent.AnthropicClient;
import com.glumbi.service.TextToSpeechService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.glumbi.service.AudioTokenService;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/learn")
@RequiredArgsConstructor
public class LearnController {

    @Value("${app.cache.tts-max-size:200}") private int ttsCacheMaxSize;
    @Value("${app.cache.tts-ttl-hours:6}")  private int ttsCacheTtlHours;

    private Cache<String, byte[]> audioCache;

    @PostConstruct
    void initCache() {
        audioCache = Caffeine.newBuilder()
                .maximumSize(ttsCacheMaxSize)
                .expireAfterAccess(ttsCacheTtlHours, TimeUnit.HOURS)
                .build();
    }

    private final AnthropicClient anthropicClient;
    private final TextToSpeechService ttsService;
    private final AudioTokenService audioTokenService;
    private final ActivityRepository activityRepository;
    private final ChildRepository childRepository;
    private final ApiQuotaService quotaService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.fast-model}")                       private String fastModel;
    @Value("${anthropic.max-tokens.learn-pronunciation}")   private int pronunciationMaxTokens;
    @Value("${anthropic.max-tokens.learn-letter}")          private int letterMaxTokens;

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal AuthUser authUser) {
        String imageData  = body.get("imageData");
        String letter     = body.get("letter");
        String script     = body.getOrDefault("script", "english");
        String childName  = body.getOrDefault("childName", "you");
        int    childAge   = Integer.parseInt(body.getOrDefault("childAge", "4"));
        Long   childId    = null;
        try { if (body.containsKey("childId")) childId = Long.parseLong(body.get("childId")); } catch (Exception ignored) {}

        if (imageData == null || letter == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "imageData and letter are required"));
        }
        if (!quotaService.isFeatureEnabled(authUser.id(), "learn-validate")) {
            return ResponseEntity.status(403).body(Map.of("error", "Learn to Write is currently unavailable."));
        }

        String scriptLabel = switch (script) {
            case "tamil"     -> "Tamil";
            case "hindi"     -> "Hindi";
            case "malayalam" -> "Malayalam";
            case "kannada"   -> "Kannada";
            case "telugu"    -> "Telugu";
            default          -> "English";
        };
        String prompt = String.format(
            "A %d-year-old child named %s is learning to write the %s letter/character \"%s\". " +
            "IMPORTANT RULES:\n" +
            "- Set \"correct\" to TRUE if there are ANY visible pen strokes on the canvas, even if messy or imperfect.\n" +
            "- Set \"correct\" to FALSE ONLY if the canvas is completely blank (no marks at all).\n" +
            "- Never judge accuracy. If the child made any effort, correct=true.\n" +
            "Respond ONLY with a JSON object with two fields:\n" +
            "\"correct\": true or false,\n" +
            "\"feedback\": a warm, enthusiastic 1-2 sentence message in simple English for a %d-year-old. " +
            "MUST mention the specific letter \"%s\" by name in the feedback. Celebrate their attempt at this specific letter, not just generic effort. " +
            "Only respond with the JSON, no other text.",
            childAge, childName, scriptLabel, letter, childAge, letter
        );

        try {
            ObjectNode request = mapper.createObjectNode();
            request.put("model", fastModel);
            request.put("max_tokens", pronunciationMaxTokens);

            ArrayNode messages = request.putArray("messages");
            ObjectNode msg = messages.addObject();
            msg.put("role", "user");
            ArrayNode content = msg.putArray("content");

            ObjectNode imgBlock = content.addObject();
            imgBlock.put("type", "image");
            ObjectNode source = imgBlock.putObject("source");
            source.put("type", "base64");
            source.put("media_type", "image/png");
            source.put("data", imageData);

            content.addObject().put("type", "text").put("text", prompt);

            String raw = anthropicClient.call(request);

            JsonNode root     = mapper.readTree(raw);
            String   text     = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode result   = mapper.readTree(text);
            boolean  correct  = result.path("correct").asBoolean();
            String   feedback = result.path("feedback").asText("Great try! Keep going! 🌟");

            // Save successful letter practice to timeline
            if (correct && childId != null) {
                final Long fChildId = childId;
                childRepository.findById(fChildId).ifPresent(child -> {
                    String emoji  = switch (script) {
                        case "tamil" -> "🌺"; case "hindi" -> "🇮🇳";
                        case "malayalam" -> "🌴"; case "kannada" -> "🏵️"; case "telugu" -> "🌸";
                        default -> "🔤";
                    };
                    String label  = switch (script) {
                        case "tamil" -> "Tamil"; case "hindi" -> "Hindi";
                        case "malayalam" -> "Malayalam"; case "kannada" -> "Kannada"; case "telugu" -> "Telugu";
                        default -> "English";
                    };
                    Activity entry = new Activity();
                    entry.setChild(child);
                    entry.setTitle("Wrote " + letter + " (" + label + ")");
                    entry.setDescription(feedback);
                    entry.setCategory("learn");
                    entry.setEmoji(emoji);
                    entry.setCompleted(true);
                    activityRepository.save(entry);
                });
            }

            if (!quotaService.tryConsume(authUser.id(), "learn-validate", childId)) {
                return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
            }
            return ResponseEntity.ok(Map.of("correct", correct, "feedback", feedback));

        } catch (Exception e) {
            // Anthropic failed — do not charge credit
            return ResponseEntity.ok(Map.of("correct", true, "feedback", "Great effort! Keep practising! 🌟"));
        }
    }

    @PostMapping("/word")
    public ResponseEntity<?> identifyWord(@RequestBody Map<String, String> body,
                                          @AuthenticationPrincipal AuthUser authUser) {
        String imageData  = body.get("imageData");
        String targetWord = body.getOrDefault("targetWord", "");  // the word the child is practising
        String childName  = body.getOrDefault("childName", "you");
        String script     = body.getOrDefault("script", "tamil");
        int    childAge   = Integer.parseInt(body.getOrDefault("childAge", "5"));
        Long   childId    = null;
        try { if (body.containsKey("childId")) childId = Long.parseLong(body.get("childId")); } catch (Exception ignored) {}

        if (imageData == null) return ResponseEntity.badRequest().body(Map.of("error", "imageData required"));
        if (!quotaService.isFeatureEnabled(authUser.id(), "learn-word")) {
            return ResponseEntity.status(403).body(Map.of("error", "Learn to Write is currently unavailable."));
        }

        String scriptLabel  = switch (script) {
            case "tamil" -> "Tamil"; case "hindi" -> "Hindi";
            case "malayalam" -> "Malayalam"; case "kannada" -> "Kannada"; case "telugu" -> "Telugu";
            default -> "English";
        };
        // cross-language key used for timeline save
        String crossTransKey = script.equals("english") ? "tamil" : "english";

        String prompt = String.format(
            "A %d-year-old child named %s has practised writing the %s word \"%s\" on a white canvas. " +
            "IMPORTANT RULES:\n" +
            "- Set \"correct\" to TRUE if there are ANY visible pen strokes on the canvas, even if messy or imperfect. " +
            "Children's handwriting is naturally rough — reward every attempt.\n" +
            "- Set \"correct\" to FALSE ONLY if the canvas is completely blank (no marks at all).\n" +
            "- Never judge letter-by-letter accuracy. If the child made an effort, correct=true.\n" +
            "Respond ONLY with a valid JSON object, no markdown:\n" +
            "{\n" +
            "  \"correct\": true or false,\n" +
            "  \"word\": \"%s\",\n" +
            "  \"couldRead\": true,\n" +
            "  \"feedback\": \"a warm, enthusiastic 1-2 sentence celebration for a %d-year-old who just practised writing\",\n" +
            "  \"meaning\": \"a simple 1-2 sentence explanation of what '%s' means in English\",\n" +
            "  \"funFact\": \"one short fun fact about this word/thing for a child\",\n" +
            "  \"emoji\": \"the single most fitting emoji\",\n" +
            "  \"translations\": {\n" +
            "    \"english\": \"English word\",\n" +
            "    \"tamil\": \"Tamil word in Tamil script\",\n" +
            "    \"hindi\": \"Hindi word in Devanagari script\",\n" +
            "    \"malayalam\": \"Malayalam word in Malayalam script\",\n" +
            "    \"kannada\": \"Kannada word in Kannada script\",\n" +
            "    \"telugu\": \"Telugu word in Telugu script\"\n" +
            "  }\n" +
            "}",
            childAge, childName, scriptLabel, targetWord,
            targetWord, childAge, targetWord
        );

        try {
            ObjectNode request = mapper.createObjectNode();
            request.put("model", fastModel);
            request.put("max_tokens", letterMaxTokens);

            ArrayNode messages = request.putArray("messages");
            ObjectNode msg = messages.addObject();
            msg.put("role", "user");
            ArrayNode content = msg.putArray("content");

            ObjectNode imgBlock = content.addObject();
            imgBlock.put("type", "image");
            ObjectNode source = imgBlock.putObject("source");
            source.put("type", "base64");
            source.put("media_type", "image/png");
            source.put("data", imageData);

            content.addObject().put("type", "text").put("text", prompt);

            String raw = anthropicClient.call(request);

            JsonNode root   = mapper.readTree(raw);
            String   text   = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode result = mapper.readTree(text);

            // Save to timeline when correct
            if (result.path("correct").asBoolean() && childId != null) {
                childRepository.findById(childId).ifPresent(child -> {
                    String translation = result.path("translations").path(crossTransKey).asText("");
                    String emoji       = result.path("emoji").asText("✏️");
                    String title       = targetWord + (translation.isBlank() ? "" : " → " + translation);
                    Activity entry = new Activity();
                    entry.setChild(child);
                    entry.setTitle(title);
                    entry.setDescription(result.path("meaning").asText(""));
                    entry.setCategory("learn");
                    entry.setEmoji(emoji);
                    entry.setCompleted(true);
                    activityRepository.save(entry);
                });
            }

            if (!quotaService.tryConsume(authUser.id(), "learn-word", childId)) {
                return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Anthropic failed — do not charge credit
            return ResponseEntity.ok(mapper.createObjectNode()
                .put("correct", false)
                .put("couldRead", false)
                .put("word", targetWord)
                .put("feedback", "Try writing a bit bigger and clearer! You've got this! 💪")
                .put("meaning", "").put("funFact", "").put("emoji", "✍️"));
        }
    }

    @GetMapping("/audio")
    public ResponseEntity<byte[]> audio(
            @RequestParam String text,
            @RequestParam(defaultValue = "english") String language,
            @RequestParam(required = false) String stoken) {
        if (!audioTokenService.validate(stoken, "learn")) {
            return ResponseEntity.status(401).build();
        }
        try {
            String lang = switch (language.toLowerCase()) {
                case "tamil"     -> "tamil";
                case "hindi"     -> "hindi";
                case "malayalam" -> "malayalam";
                case "kannada"   -> "kannada";
                case "telugu"    -> "telugu";
                default          -> "english";
            };
            String cacheKey = text.toLowerCase().trim() + ":" + lang;

            byte[] audio = audioCache.getIfPresent(cacheKey);
            if (audio == null) {
                try {
                    audio = ttsService.synthesize(text, lang);
                } catch (Exception first) {
                    // Stale gRPC channel after server idle — wait for the channel to reconnect
                    // before retrying; an immediate retry hits the same broken channel.
                    try { Thread.sleep(1500); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    audio = ttsService.synthesize(text, lang);
                }
                audioCache.put(cacheKey, audio);
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(audio);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
