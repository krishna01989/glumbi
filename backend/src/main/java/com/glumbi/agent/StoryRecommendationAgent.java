package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Child;
import com.glumbi.entity.Story;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StoryRecommendationAgent {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api-key}")    private String apiKey;
    @Value("${anthropic.model}")      private String model;

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
            String prompt = String.format("""
                    A child named %s (age %d) has recently enjoyed these stories: %s.
                    Their story keywords/themes include: %s.

                    Suggest 3 fresh story topics they would enjoy this week, based on their interests.
                    Format: one sentence introducing the suggestions, then list the 3 topics with a fun emoji each.
                    Keep it short and exciting for a parent to read.
                    Return only the message text.
                    """,
                    child.getName(), java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getYears(), recentTitles, keywords);

            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", 150);
            body.putArray("messages").addObject()
                    .put("role", "user").put("content", prompt);

            String response = webClientBuilder.build()
                    .post().uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .bodyValue(body).retrieve().bodyToMono(String.class).block();

            JsonNode root = mapper.readTree(response);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return String.format("Here are some great story ideas for %s this week: 🚀 Space Explorer, 🦁 Safari Adventure, 🧙 The Friendly Wizard.", child.getName());
        }
    }
}
