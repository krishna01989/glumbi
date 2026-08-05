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
public class TorchHuntAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                            private String model;
    @Value("${anthropic.max-tokens.torch-hunt:3500}")       private int maxTokens;

    public PackResult generate(String themeKey, String ageGroup) {
        String prompt = String.format(promptLoader.load("torch-hunt-user"), themeKey, ageGroup);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);

        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "user").put("content", prompt);

        String response = anthropicClient.callWithCachedSystem(body,
                "You are a creative game designer making age-adaptive hidden-object adventures for children.");

        return parseResponse(response);
    }

    private PackResult parseResponse(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode obj = mapper.readTree(text);

            List<TorchObject> objects = new ArrayList<>();
            for (JsonNode n : obj.path("objects")) {
                objects.add(new TorchObject(
                        n.path("name").asText(),
                        n.path("emoji").asText("❓"),
                        n.path("hint").asText(""),
                        n.path("funFact").asText("")
                ));
            }

            List<String> narratives = new ArrayList<>();
            for (JsonNode n : obj.path("narratives")) {
                narratives.add(n.asText());
            }

            return new PackResult(objects, narratives);
        } catch (Exception e) {
            return safeDefaults();
        }
    }

    private PackResult safeDefaults() {
        List<TorchObject> objects = List.of(
                new TorchObject("teddy bear", "🧸", "something soft and cuddly", "Teddy bears are named after President Theodore Roosevelt!"),
                new TorchObject("apple", "🍎", "a round crunchy fruit", "Apples float in water because they are 25% air!"),
                new TorchObject("key", "🗝️", "it opens something", "The oldest keys were found in ancient Egypt!"),
                new TorchObject("candle", "🕯️", "it gives light when lit", "Birthday candles were first used in ancient Greece!"),
                new TorchObject("book", "📚", "full of stories and knowledge", "The first printed book was made in 1440!")
        );
        List<String> narratives = List.of(
                "You enter a mysterious dark room where shadows dance on the walls.",
                "Only the glow of your torch lights the way through the darkness.",
                "Strange shapes lurk in the corners — time to investigate!",
                "Every object you find brings you closer to the treasure!"
        );
        return new PackResult(objects, narratives);
    }

    public record TorchObject(String name, String emoji, String hint, String funFact) {}
    public record PackResult(List<TorchObject> objects, List<String> narratives) {}
}
