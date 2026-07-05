package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Activity;
import com.glumbi.entity.Child;
import com.glumbi.service.ChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LearnToWriteAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper objectMapper;

    @Value("${anthropic.model}")                          private String model;
    @Value("${anthropic.max-tokens.learning-insight}")    private int maxTokens;

    public String generate(Child child, List<Activity> learnActivities) {
        // Build a summary of what was practiced
        Map<String, Long> byScript = learnActivities.stream()
                .collect(Collectors.groupingBy(a -> detectScript(a.getEmoji()), Collectors.counting()));

        String scriptSummary = byScript.isEmpty() ? "none"
                : byScript.entrySet().stream()
                    .map(e -> e.getKey() + " (" + e.getValue() + " sessions)")
                    .collect(Collectors.joining(", "));

        String items = learnActivities.stream()
                .limit(10)
                .map(Activity::getTitle)
                .collect(Collectors.joining(", "));
        if (items.isBlank()) items = "none";

        try {
            String prompt = String.format(promptLoader.load("learn-to-write-user"),
                    child.getName(),
                    ChildService.ageFromBirthYear(child.getBirthYear()),
                    scriptSummary,
                    items,
                    learnActivities.size());

            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.putArray("messages").addObject()
                    .put("role", "user").put("content", prompt);

            String response = anthropicClient.call(body);
            JsonNode root = objectMapper.readTree(response);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String detectScript(String emoji) {
        if (emoji == null) return "English";
        return switch (emoji) {
            case "🌺" -> "Tamil";
            case "🇮🇳" -> "Hindi";
            default   -> "English";
        };
    }
}
