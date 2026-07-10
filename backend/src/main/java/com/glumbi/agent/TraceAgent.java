package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TraceAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                        private String model;
    @Value("${anthropic.max-tokens.trace:200}")         private int maxTokens;

    public TraceLevel generate(String childName, int childAge, String difficulty) {
        String prompt = String.format(promptLoader.load("trace-user"), childName, childAge, difficulty, childName);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);

        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "user").put("content", prompt);

        String response = anthropicClient.callWithCachedSystem(body,
                "You are a creative game designer for young children.");

        return parseResponse(response);
    }

    private TraceLevel parseResponse(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode node = mapper.readTree(text);
            return new TraceLevel(
                    node.path("theme").asText(),
                    node.path("startEmoji").asText("🐄"),
                    node.path("endEmoji").asText("🏚️"),
                    node.path("startLabel").asText("Cow"),
                    node.path("endLabel").asText("Barn"),
                    node.path("completionStory").asText("You made it! Great job! 🎉"),
                    node.path("bgColor").asText("#e8f5e9")
            );
        } catch (Exception e) {
            return safeDefault();
        }
    }

    private TraceLevel safeDefault() {
        return new TraceLevel(
                "a cow walking home to its barn",
                "🐄", "🏚️", "Cow", "Barn",
                "The happy cow made it home just in time for dinner! What a great helper you are! 🌙",
                "#e8f5e9"
        );
    }

    public record TraceLevel(
            String theme,
            String startEmoji,
            String endEmoji,
            String startLabel,
            String endLabel,
            String completionStory,
            String bgColor
    ) {}
}
