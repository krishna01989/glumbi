package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Child;
import com.glumbi.entity.Story;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StoryRecommendationAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                            private String model;
    @Value("${anthropic.max-tokens.story-recommendation}")  private int maxTokens;

    public String generate(Child child, List<Story> recentStories) {
        if (recentStories.isEmpty()) {
            return String.format("Start %s's reading journey this week! Try topics like animals, adventure, or space. ✨", child.getName());
        }

        String recentTitles = recentStories.stream()
                .limit(5)
                .map(Story::getTitle)
                .collect(Collectors.joining(", "));

        String keywords = recentStories.stream()
                .limit(5)
                .map(s -> s.getKeywords() != null ? s.getKeywords() : "")
                .filter(k -> !k.isBlank())
                .collect(Collectors.joining(", "));

        try {
            String prompt = String.format(promptLoader.load("story-recommendation-user"),
                    child.getName(), com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear()),
                    recentTitles, keywords);

            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.putArray("messages").addObject()
                    .put("role", "user").put("content", prompt);

            String response = anthropicClient.call(body);

            JsonNode root = mapper.readTree(response);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return String.format("Here are some great story ideas for %s this week: 🚀 Space Explorer, 🦁 Safari Adventure, 🧙 The Friendly Wizard.", child.getName());
        }
    }
}
