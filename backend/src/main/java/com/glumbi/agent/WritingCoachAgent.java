package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WritingCoachAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                     private String model;
    @Value("${anthropic.max-tokens.writing-coach}")  private int maxTokens;

    public CoachResult getFeedback(String childName, int childAge, String title, String writing) {
        safety.validateInput(writing);

        // Validate the writing content for safety before sending to Claude
        if (!safety.isOutputSafe(writing)) {
            throw new SafetyGuard.SafetyException(
                "Oops! Please keep your story fun and friendly 🌟"
            );
        }

        String system = safety.safetySystemPreamble() + String.format(
                promptLoader.load("writing-coach-system"), childAge, coachGuidance(childAge), childAge);

        String prompt = String.format(promptLoader.load("writing-coach-user"),
                childName, childAge, title, writing);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.put("system", system);
        body.putArray("messages").addObject().put("role", "user").put("content", prompt);

        String response = anthropicClient.call(body);

        return parseResponse(response, childName);
    }

    private String coachGuidance(int age) {
        if (age <= 7) return "For this age: celebrate any attempt at storytelling, focus on imagination over grammar. Suggestions should be about adding fun details (sounds, colours, feelings) — never correct spelling or punctuation.";
        if (age <= 9) return "For this age: praise their ideas and sentence variety. Suggestions can gently introduce show-don't-tell, dialogue, or stronger verbs. Avoid correcting spelling.";
        return "For this age: they can handle feedback on structure, character depth, and word choice. Suggestions can be more specific about craft — but always keep it positive and motivating.";
    }

    private CoachResult parseResponse(String raw, String childName) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode node = mapper.readTree(text);

            CoachResult result = new CoachResult(
                node.path("praise").asText(),
                node.path("suggestion").asText(),
                node.path("encouragement").asText(),
                node.path("starWord").asText(),
                node.path("badge").asText("⭐")
            );

            // Safety check the feedback before returning
            String allText = result.praise() + " " + result.suggestion() + " " + result.encouragement();
            if (!safety.isOutputSafe(allText)) {
                return safeFallback(childName);
            }
            return result;
        } catch (Exception e) {
            return safeFallback(childName);
        }
    }

    private CoachResult safeFallback(String childName) {
        return new CoachResult(
            childName + ", your story is so creative and imaginative! I love the way you told it.",
            "Try adding one more detail about what your character sees or hears — it will make the scene feel magical!",
            "Keep writing — you're a fantastic storyteller! 🌟",
            "creative",
            "⭐"
        );
    }

    public record CoachResult(
        String praise,
        String suggestion,
        String encouragement,
        String starWord,
        String badge
    ) {}
}
