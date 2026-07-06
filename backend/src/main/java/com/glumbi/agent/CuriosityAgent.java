package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * CuriosityAgent — answers a child's "why" question in a fun, age-appropriate way.
 *
 * Agentic pattern: structured multi-output generation.
 * One question → agent produces 5 distinct outputs in one pass:
 *   1. Fun fact 1 (simple)
 *   2. Fun fact 2 (wow factor)
 *   3. Fun fact 3 (relatable analogy)
 *   4. A quiz question to reinforce learning
 *   5. 3 answer options + correct answer
 *
 * This teaches kids through the "tell, amaze, relate, test" learning cycle.
 */
@Component
@RequiredArgsConstructor
public class CuriosityAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final RelevanceGuard relevance;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                private String model;
    @Value("${anthropic.max-tokens.curiosity}") private int maxTokens;

    public CuriosityResult explain(String question, String childName, int childAge) {
        // Layer 0 — relevance (is this a child-appropriate curiosity question?)
        relevance.validate(question, RelevanceGuard.Context.CURIOSITY);
        // Layer 1 — safety
        safety.validateInput(question);

        String prompt = String.format(promptLoader.load("curiosity-user"),
                childAge, childName, question, childAge, childAge, ageComparisons(childAge));

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);

        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "user").put("content", prompt);

        String response = anthropicClient.callWithCachedSystem(body,
                safety.safetySystemPreamble(),
                "You are a fun, friendly science explainer for young children.");

        CuriosityResult result = parseResponse(response, question);

        // Layer 3 — validate output
        if (!safety.isOutputSafe(result.funFact1() + result.funFact2() + result.funFact3())) {
            return safeDefault();
        }
        return result;
    }

    private String ageComparisons(int age) {
        if (age <= 3) return "toys, juice, animals, bubbles, and simple everyday things";
        if (age <= 5) return "toys, food, animals, and things they see at home or the park";
        if (age <= 7) return "games, animals, sports, food, and school activities";
        if (age <= 9) return "science experiments, books, sports, and things from school";
        return "experiments, technology, nature, sports, and real-world examples";
    }

    private CuriosityResult parseResponse(String raw, String question) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();

            JsonNode node = mapper.readTree(text);
            return new CuriosityResult(
                    node.path("funFact1").asText(),
                    node.path("funFact2").asText(),
                    node.path("funFact3").asText(),
                    node.path("quizQuestion").asText(),
                    node.path("quizAnswer").asText(),
                    node.path("quizOption1").asText(),
                    node.path("quizOption2").asText(),
                    node.path("quizOption3").asText(),
                    node.path("sticker").asText("🌟")
            );
        } catch (Exception e) {
            return safeDefault();
        }
    }

    private CuriosityResult safeDefault() {
        return new CuriosityResult(
            safety.safeFallback("curiosity"),
            "Scientists discover new amazing things every single day!",
            "It's like the world is one big magic trick!",
            "Is the world full of amazing things?",
            "Yes!", "Yes!", "Maybe", "No", "🌟"
        );
    }

    public record CuriosityResult(
            String funFact1, String funFact2, String funFact3,
            String quizQuestion, String quizAnswer,
            String quizOption1, String quizOption2, String quizOption3,
            String sticker) {}
}
