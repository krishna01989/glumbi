package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Child;
import com.glumbi.entity.JournalEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JournalInsightAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}") private String model;

    public String generate(Child child, List<JournalEntry> entries) {
        if (entries.isEmpty()) return null;

        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        // Find dominant mood this week
        String dominantMood = entries.stream()
                .filter(j -> j.getMood() != null && !j.getMood().isBlank())
                .collect(Collectors.groupingBy(JournalEntry::getMood, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        // Collect moods list for colour
        String moodSummary = dominantMood != null
                ? "The most frequent mood was: " + dominantMood + "."
                : "No mood was recorded.";

        String prompt = String.format(
            "Write a warm 1-2 sentence weekly summary for a parent about their child %s (age %d) " +
            "who wrote %d journal entr(ies) this week. %s " +
            "Acknowledge the journaling habit positively and mention the mood if available. " +
            "No markdown. Refer to the child by name only, no pronouns.",
            child.getName(), age, entries.size(), moodSummary);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 200);
        body.putArray("messages").addObject().put("role", "user").put("content", prompt);

        try {
            String response = anthropicClient.callWithCachedSystem(body,
                    safety.safetySystemPreamble(),
                    "You write brief, warm parent notifications for a kids learning app.");
            JsonNode root = mapper.readTree(response);
            String text = root.path("content").get(0).path("text").asText().trim();
            return safety.isOutputSafe(text) ? text : null;
        } catch (Exception e) {
            return child.getName() + " wrote " + entries.size() + " journal entr(ies) this week — wonderful self-expression!";
        }
    }
}
