package com.glumbi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Activity;
import com.glumbi.entity.Child;
import com.glumbi.repository.ActivityRepository;
import com.glumbi.repository.ChildRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.TextToSpeechService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@RestController
@RequestMapping("/api/learn")
@RequiredArgsConstructor
public class LearnController {

    private final WebClient.Builder webClientBuilder;
    private final TextToSpeechService ttsService;
    private final ActivityRepository activityRepository;
    private final ChildRepository childRepository;
    private final ApiQuotaService quotaService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api-key}") private String apiKey;

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
        if (!quotaService.tryConsume(authUser.id())) {
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
        }

        String scriptLabel = script.equals("tamil") ? "Tamil" : "English";
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
            request.put("model", "claude-haiku-4-5-20251001");
            request.put("max_tokens", 200);

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

            String raw = webClientBuilder.build()
                    .post().uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .bodyValue(request)
                    .retrieve().bodyToMono(String.class).block();

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
                    String emoji = script.equals("tamil") ? "🌺" : "🔤";
                    Activity entry = new Activity();
                    entry.setChild(child);
                    entry.setTitle("Wrote " + letter + " (" + (script.equals("tamil") ? "Tamil" : "English") + ")");
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
        if (!quotaService.tryConsume(authUser.id())) {
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
        }

        boolean isTamil     = script.equals("tamil");
        String  scriptLabel = isTamil ? "Tamil" : "English";
        String  primaryTrans = isTamil
            ? "\"tamil\": \"" + targetWord + "\""
            : "\"tamil\": \"Tamil translation in Tamil script\"";

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
            request.put("model", "claude-haiku-4-5-20251001");
            request.put("max_tokens", 400);

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

            String raw = webClientBuilder.build()
                    .post().uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .bodyValue(request)
                    .retrieve().bodyToMono(String.class).block();

            JsonNode root   = mapper.readTree(raw);
            String   text   = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode result = mapper.readTree(text);

            // Save to timeline when correct
            if (result.path("correct").asBoolean() && childId != null) {
                childRepository.findById(childId).ifPresent(child -> {
                    String translation = result.path("translations").path(isTamil ? "english" : "tamil").asText("");
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
