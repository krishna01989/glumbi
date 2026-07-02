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

import java.util.Map;

@RestController
@RequestMapping("/api/learn")
@RequiredArgsConstructor
public class LearnController {

    private final AnthropicClient anthropicClient;
    private final TextToSpeechService ttsService;
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
        if (!quotaService.tryConsume(authUser.id(), "learn-validate")) {
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
        }

        String scriptLabel = switch (script) { case "tamil" -> "Tamil"; case "hindi" -> "Hindi"; default -> "English"; };
        String prompt = String.format(
            "A %d-year-old child named %s is learning to write the %s letter/character \"%s\". " +
            "Look at their drawing and decide: does it resemble \"%s\"? " +
            "Respond with a JSON object with two fields: " +
            "\"correct\": true or false (be generous — any reasonable attempt counts as true), " +
            "\"feedback\": a warm 1-2 sentence message in simple English for a %d-year-old. " +
            "If correct, celebrate enthusiastically! If not quite right, be very gentle and encouraging — never discouraging. " +
            "Only respond with the JSON, no other text.",
            childAge, childName, scriptLabel, letter, letter, childAge
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
                    String emoji  = switch (script) { case "tamil" -> "🌺"; case "hindi" -> "🇮🇳"; default -> "🔤"; };
                    String label  = switch (script) { case "tamil" -> "Tamil"; case "hindi" -> "Hindi"; default -> "English"; };
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

            return ResponseEntity.ok(Map.of("correct", correct, "feedback", feedback));

        } catch (Exception e) {
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
        if (!quotaService.tryConsume(authUser.id(), "learn-word")) {
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
        }

        String scriptLabel  = switch (script) { case "tamil" -> "Tamil"; case "hindi" -> "Hindi"; default -> "English"; };
        String primaryTrans = switch (script) {
            case "tamil"  -> "\"tamil\": \"" + targetWord + "\"";
            case "hindi"  -> "\"hindi\": \"" + targetWord + "\"";
            default       -> "\"tamil\": \"Tamil translation in Tamil script\"";
        };
        // cross-language key used for timeline save
        String crossTransKey = switch (script) { case "tamil" -> "english"; default -> "tamil"; };

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
            "  \"meaning\": \"a simple 1-2 sentence explanation of what '%s' means\",\n" +
            "  \"funFact\": \"one short fun fact about this word/thing for a child\",\n" +
            "  \"emoji\": \"the single most fitting emoji\",\n" +
            "  \"translations\": {\n" +
            "    %s,\n" +
            "    \"hindi\": \"Hindi word in Devanagari script\",\n" +
            "    \"french\": \"French word\"\n" +
            "  }\n" +
            "}",
            childAge, childName, scriptLabel, targetWord,
            targetWord, childAge, targetWord, primaryTrans
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

            return ResponseEntity.ok(result);
        } catch (Exception e) {
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
            @RequestParam(defaultValue = "english") String language) {
        try {
            // Map script names to TTS language codes
            String lang = switch (language.toLowerCase()) {
                case "tamil"   -> "tamil";
                case "hindi"   -> "hindi";
                default        -> "english";
            };
            byte[] audio = ttsService.synthesize(text, lang);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "audio/mpeg")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(audio);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
