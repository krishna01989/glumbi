package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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
