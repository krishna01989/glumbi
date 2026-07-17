package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DrawAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.fast-model}")            private String fastModel;
    @Value("${anthropic.model}")                 private String model;
    @Value("${anthropic.max-tokens.draw}")       private int identifyTokens;
    @Value("${anthropic.max-tokens.draw-guide}") private int guideTokens;
    @Value("${anthropic.max-tokens.draw-animate}") private int animateTokens;

    public String identifyDrawing(String imageDataBase64, String childName, int childAge, String subject) {
        try {
            String subjectContext = (subject != null && !subject.isBlank())
                ? "They were trying to draw a " + subject + " — give specific, encouraging praise about their attempt."
                : "Guess what it might be (even if it's just scribbles — be creative!).";
            String system = String.format(promptLoader.load("draw-identify-system"), childName, childAge, subjectContext);

            ObjectNode request = mapper.createObjectNode();
            request.put("model", fastModel);
            request.put("max_tokens", identifyTokens);
            request.put("system", system);

            var msg = request.putArray("messages").addObject();
            msg.put("role", "user");
            var content = msg.putArray("content");

            var imgBlock = content.addObject();
            imgBlock.put("type", "image");
            var source = imgBlock.putObject("source");
            source.put("type", "base64");
            source.put("media_type", "image/png");
            source.put("data", imageDataBase64);

            content.addObject().put("type", "text").put("text", "What did I draw?");

            String raw = anthropicClient.call(request);
            JsonNode root = mapper.readTree(raw);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Analyzes a drawing for animation: returns JSON with detected objects and tags,
     * or {"blocked":true} if the drawing contains unsafe content.
     */
    public String animateDrawing(String imageDataBase64, String childName, int childAge, String subject) {
        try {
            String subjectHint = (subject != null && !subject.isBlank()) ? subject : "something";
            String system = String.format(promptLoader.load("draw-animate-system"), childName, childAge, subjectHint);

            ObjectNode request = mapper.createObjectNode();
            request.put("model", fastModel);
            request.put("max_tokens", animateTokens);
            request.put("system", system);

            var msg = request.putArray("messages").addObject();
            msg.put("role", "user");
            var content = msg.putArray("content");

            var imgBlock = content.addObject();
            imgBlock.put("type", "image");
            var source = imgBlock.putObject("source");
            source.put("type", "base64");
            source.put("media_type", "image/png");
            source.put("data", imageDataBase64);

            content.addObject().put("type", "text").put("text", "Identify what is in this drawing. Return only JSON.");

            String raw = anthropicClient.call(request);
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText().trim();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            return text;
        } catch (Exception e) {
            log.error("animateDrawing failed: {}", e.getMessage(), e);
            return null;
        }
    }

    public String generateGuide(String subject, String childName, int childAge) {
        try {
            String system = String.format(promptLoader.load("draw-guide-system"), childName, childAge, subject);
            String prompt = String.format(promptLoader.load("draw-guide-user"), subject);

            ObjectNode request = mapper.createObjectNode();
            request.put("model", model);
            request.put("max_tokens", guideTokens);
            request.put("system", system);
            request.putArray("messages").addObject().put("role", "user").put("content", prompt);

            String raw = anthropicClient.call(request);
            JsonNode root = mapper.readTree(raw);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return null;
        }
    }
}
