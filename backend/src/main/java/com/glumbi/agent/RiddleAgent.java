package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RiddleAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                        private String model;
    @Value("${anthropic.max-tokens.riddle:600}")        private int maxTokens;

    public List<RiddleItem> generate(String childName, int childAge) {
        String prompt = String.format(promptLoader.load("riddle-user"), childName, childAge);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);

        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "user").put("content", prompt);

        String response = anthropicClient.callWithCachedSystem(body,
                "You are a fun riddle master for young children.");

        return parseResponse(response);
    }

    private List<RiddleItem> parseResponse(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode arr = mapper.readTree(text);
            List<RiddleItem> items = new ArrayList<>();
            for (JsonNode node : arr) {
                items.add(new RiddleItem(
                        node.path("question").asText(),
                        node.path("hint").asText(),
                        node.path("answer").asText(),
                        node.path("emoji").asText("❓")
                ));
            }
            return items;
        } catch (Exception e) {
            return safeDefaults();
        }
    }

    private List<RiddleItem> safeDefaults() {
        return List.of(
                new RiddleItem("I have hands but cannot clap. What am I?",
                        "You look at me to know the time", "clock", "🕐"),
                new RiddleItem("I have colours but no paint. What am I?",
                        "You see me after it rains", "rainbow", "🌈"),
                new RiddleItem("I show your face but I'm not a photo. What am I?",
                        "You look into me when you get dressed", "mirror", "🪞")
        );
    }

    public record RiddleItem(
            String question,
            String hint,
            String answer,
            String emoji
    ) {}
}
