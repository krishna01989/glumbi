package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Child;
import com.glumbi.entity.CuriosityEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CuriosityInsightAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}") private String model;

    public String generate(Child child, List<CuriosityEntry> entries) {
        if (entries.isEmpty()) return null;

        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        String questions = entries.stream()
                .limit(5)
                .map(e -> "- " + e.getQuestion())
                .collect(Collectors.joining("\n"));

        String prompt = String.format(
            "Write a warm 1-2 sentence weekly summary for a parent about their child %s (age %d) " +
            "who asked %d curiosity question(s) this week. " +
            "Here are some of the questions:\n%s\n" +
            "Highlight the breadth of curiosity. Be encouraging. No markdown. Refer to the child by name only, no pronouns.",
            child.getName(), age, entries.size(), questions);

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
            return child.getName() + " asked " + entries.size() + " great question(s) this week — what a curious mind!";
        }
    }
}
