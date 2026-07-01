package com.glumbi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@RestController
@RequestMapping("/api/draw")
@RequiredArgsConstructor
public class DrawController {

    private final WebClient.Builder webClientBuilder;
    private final ApiQuotaService   quotaService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api-key}") private String apiKey;

    @PostMapping("/identify")
    public ResponseEntity<?> identify(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal AuthUser authUser) {
        String imageData = body.get("imageData");
        String childName = body.getOrDefault("childName", "you");
        int childAge     = Integer.parseInt(body.getOrDefault("childAge", "4"));

        if (imageData == null || imageData.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image provided"));
        }
        if (!quotaService.tryConsume(authUser.id())) {
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
        }

        try {
            ObjectNode request = mapper.createObjectNode();
            request.put("model", "claude-haiku-4-5-20251001");
            request.put("max_tokens", 256);
            request.put("system", String.format(
                "You are a warm, encouraging art teacher talking to %s who is %d years old. " +
                "Look at their drawing and respond with pure joy and imagination. " +
                "Guess what it might be (even if it's just scribbles — be creative!). " +
                "Keep your response to 2-3 short, excited sentences. Use simple words. " +
                "Add a relevant emoji at the end. Never say 'I can see' — just dive straight in.",
                childName, childAge
            ));

            ArrayNode messages = request.putArray("messages");
            ObjectNode msg = messages.addObject();
            msg.put("role", "user");

            ArrayNode content = msg.putArray("content");

            // Image block
            ObjectNode imgBlock = content.addObject();
            imgBlock.put("type", "image");
            ObjectNode source = imgBlock.putObject("source");
            source.put("type", "base64");
            source.put("media_type", "image/png");
            source.put("data", imageData);

            // Text block
            content.addObject().put("type", "text").put("text", "What did I draw?");

            String raw = webClientBuilder.build()
                    .post().uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .bodyValue(request)
                    .retrieve().bodyToMono(String.class).block();

            JsonNode root = mapper.readTree(raw);
            String response = root.path("content").get(0).path("text").asText();
            return ResponseEntity.ok(Map.of("response", response));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Could not identify drawing"));
        }
    }
}
