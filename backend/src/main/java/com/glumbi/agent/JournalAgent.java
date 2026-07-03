package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JournalAgent {

    private final AnthropicClient anthropicClient;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")              private String model;
    @Value("${anthropic.max-tokens.journal}") private int maxTokens;

    public record JournalResult(String content, String mood, String milestone) {}

    public JournalResult generateEntry(String childName, int age, List<String> activitySummaries) {
        // Cap to 5 activities so the AI response stays bounded
        List<String> capped = activitySummaries.stream().limit(5).toList();
        String activitiesText = capped.isEmpty()
            ? "No specific activities recorded today."
            : String.join("\n", capped.stream().map(a -> "- " + a).toList());

        String system = """
            You are a journal assistant. Always respond with a single valid JSON object — no markdown, no explanation, nothing else.
            The JSON must have exactly three fields: content (string), mood (string), milestone (string).
            Keep content to 2-3 warm sentences written from a parent's perspective. Be concise.
            """;

        String prompt = String.format("""
            Child: %s (age %d)
            Today's activities:
            %s

            Return JSON with:
            - content: 2-3 sentence heartfelt journal entry, first person (e.g. "Today %s...")
            - mood: exactly one of: happy, excited, proud, curious, calm, tired, sad, grumpy, silly
            - milestone: short tag if something notable happened, else empty string
            """, childName, age, activitiesText, childName);

        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.put("system", system);
            body.putArray("messages").addObject().put("role", "user").put("content", prompt);

            String response = anthropicClient.call(body);
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
            System.err.println("[JournalAgent] Failed to generate entry: " + e.getMessage());
            return null;
        }
    }
}
