package com.glumbi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.agent.AnthropicClient;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/draw")
@RequiredArgsConstructor
public class DrawController {

    private final AnthropicClient  anthropicClient;
    private final ApiQuotaService  quotaService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.fast-model}")      private String fastModel;
    @Value("${anthropic.max-tokens.draw}") private int maxTokens;

    @PostMapping("/identify")
    public ResponseEntity<?> identify(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal AuthUser authUser) {
        String imageData = body.get("imageData");
        String childName = body.getOrDefault("childName", "you");
        int childAge     = Integer.parseInt(body.getOrDefault("childAge", "4"));

        if (imageData == null || imageData.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image provided"));
        }
        if (!quotaService.isFeatureEnabled(authUser.id(), "draw")) {
            return ResponseEntity.status(403).body(Map.of("error", "Drawing is currently unavailable."));
        }
        if (!quotaService.tryConsume(authUser.id(), "draw")) {
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));
        }

        try {
            ObjectNode request = mapper.createObjectNode();
            request.put("model", fastModel);
            request.put("max_tokens", maxTokens);
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

            String raw = anthropicClient.call(request);

            JsonNode root = mapper.readTree(raw);
            String response = root.path("content").get(0).path("text").asText();
            return ResponseEntity.ok(Map.of("response", response));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Could not identify drawing"));
        }
    }
}
