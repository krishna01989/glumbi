package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JournalAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")              private String model;
    @Value("${anthropic.max-tokens.journal}") private int maxTokens;

    public record JournalResult(String content, String mood, String milestone) {}

    public JournalResult generateEntry(String childName, int age, List<String> activitySummaries, String selectedMood) {
        // Cap to 5 activities so the AI response stays bounded
        List<String> capped = activitySummaries.stream().limit(5).toList();
        String activitiesText = capped.isEmpty()
            ? "No specific activities recorded today."
            : String.join("\n", capped.stream().map(a -> "- " + a).toList());

        String moodInstruction = (selectedMood != null && !selectedMood.isBlank())
            ? "\n<selected_mood>" + selectedMood + "</selected_mood>\nThe child/parent selected this mood — use it as-is in the mood field and reflect it in the writing tone."
            : "";

        String system = promptLoader.load("journal-system");
        String prompt = String.format(promptLoader.load("journal-user"), childName, age, activitiesText, childName) + moodInstruction;

        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.putArray("messages").addObject().put("role", "user").put("content", prompt);

            String response = anthropicClient.callWithCachedSystem(body, system);
            JsonNode root = mapper.readTree(response);
            String text = root.path("content").get(0).path("text").asText().trim();

            // Strip markdown code fences if present
            text = text.replaceAll("(?s)^```[a-zA-Z]*\\s*", "").replaceAll("(?s)\\s*```$", "").trim();

            JsonNode json = mapper.readTree(text);
            String content   = json.path("content").asText().trim();
            String mood      = json.path("mood").asText("happy").trim();
            String milestone = json.path("milestone").asText("").trim();

            return new JournalResult(content, mood, milestone);
        } catch (Exception e) {
            log.error("Failed to generate journal entry: {}", e.getMessage());
            return null;
        }
    }
}
