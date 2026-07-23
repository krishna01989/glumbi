package com.glumbi.agent;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class MemoryPlayAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                         private String model;
    @Value("${anthropic.max-tokens.memory-flashcards}")  private int flashcardTokens;
    @Value("${anthropic.max-tokens.word-of-day}")        private int wordTokens;
    @Value("${anthropic.max-tokens.memory-match}")       private int matchTokens;

    // ── Flashcards ────────────────────────────────────────────────────────────

    public List<Map<String, String>> generateFlashcards(String childName, int age, String topic) {
        safety.validateInput(topic);

        String agentPrompt = String.format(promptLoader.load("memory-flashcards-system"), age);
        String prompt = String.format(promptLoader.load("memory-flashcards-user"), topic, childName, age);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", flashcardTokens);
        body.putArray("messages").addObject().put("role", "user").put("content", prompt);

        try {
            String response = anthropicClient.callWithCachedSystem(body, safety.safetySystemPreamble(), agentPrompt);
            JsonNode root = mapper.readTree(response);
            String text = root.path("content").get(0).path("text").asText();
            text = stripCodeFences(text);
            if (!safety.isOutputSafe(text)) return flashcardFallback(topic);
            return mapper.readValue(text, new TypeReference<List<Map<String, String>>>() {});
        } catch (Exception e) {
            return flashcardFallback(topic);
        }
    }

    private List<Map<String, String>> flashcardFallback(String topic) {
        return List.of(
            Map.of("q", "What is " + topic + "?", "a", "It is something fun and interesting to learn about!"),
            Map.of("q", "Can you name one thing about " + topic + "?", "a", "There are many amazing things to discover!"),
            Map.of("q", "Why is " + topic + " interesting?", "a", "Because learning new things is always exciting!"),
            Map.of("q", "What do you know about " + topic + "?", "a", "Lots of amazing facts are waiting to be found!"),
            Map.of("q", "Tell me something about " + topic + "!", "a", "Every topic has something wonderful hidden inside."),
            Map.of("q", "What did you learn about " + topic + " today?", "a", "Something new and exciting every day!")
        );
    }

    // ── Word of Day ───────────────────────────────────────────────────────────

    public record WordResult(String word, String meaning, String exampleSentence, String pronunciation, String emoji) {}

    public WordResult generateWordOfDay(String childName, int age, java.time.LocalDate date, List<String> recentWords) {
        String agentPrompt = String.format(promptLoader.load("memory-wordofday-system"), age);
        String avoidClause = recentWords.isEmpty() ? "" :
                "\nDo NOT use any of these recently used words: " + String.join(", ", recentWords) + ".";
        String prompt = String.format(promptLoader.load("memory-wordofday-user"), childName, age, date.toString(), age) + avoidClause;

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", wordTokens);
        body.putArray("messages").addObject().put("role", "user").put("content", prompt);

        try {
            String response = anthropicClient.callWithCachedSystem(body, safety.safetySystemPreamble(), agentPrompt);
            JsonNode root = mapper.readTree(response);
            String text = root.path("content").get(0).path("text").asText();
            text = stripCodeFences(text);
            if (!safety.isOutputSafe(text)) return null;
            JsonNode node = mapper.readTree(text);
            String word = capitalize(node.path("word").asText(""));
            if (word.isBlank() || !isWordSafeForAge(word, age)) return null;
            return new WordResult(
                word,
                node.path("meaning").asText("Something truly amazing."),
                node.path("exampleSentence").asText("The world is a wonderful place!"),
                node.path("pronunciation").asText("WUN-der-ful"),
                node.path("emoji").asText("✨")
            );
        } catch (Exception e) {
            log.error("Word of Day generation failed: {}", e.getMessage());
            return null;
        }
    }

    // ── Memory Match ──────────────────────────────────────────────────────────

    public List<Map<String, String>> generateMatchPairs(String childName, int age, String theme) {
        safety.validateInput(theme);

        String agentPrompt = String.format(promptLoader.load("memory-match-system"), age);
        String prompt = String.format(promptLoader.load("memory-match-user"), theme, childName, age);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", matchTokens);
        body.putArray("messages").addObject().put("role", "user").put("content", prompt);

        try {
            String response = anthropicClient.callWithCachedSystem(body, safety.safetySystemPreamble(), agentPrompt);
            JsonNode root = mapper.readTree(response);
            String text = root.path("content").get(0).path("text").asText();
            text = stripCodeFences(text);
            if (!safety.isOutputSafe(text)) return matchFallback();
            return mapper.readValue(text, new TypeReference<List<Map<String, String>>>() {});
        } catch (Exception e) {
            return matchFallback();
        }
    }

    private List<Map<String, String>> matchFallback() {
        return List.of(
            Map.of("emoji", "🐶", "label", "Dog"),
            Map.of("emoji", "🐱", "label", "Cat"),
            Map.of("emoji", "🐸", "label", "Frog"),
            Map.of("emoji", "🦋", "label", "Butterfly"),
            Map.of("emoji", "🐘", "label", "Elephant"),
            Map.of("emoji", "🦁", "label", "Lion")
        );
    }

    // ── Weekly Insight ────────────────────────────────────────────────────────

    public String generateWeeklyInsight(String childName, int age, int flashcardSets, int wordsLearned, int matchGames) {
        if (flashcardSets == 0 && wordsLearned == 0 && matchGames == 0) return null;

        String prompt = String.format(
            "Write a warm 1-2 sentence weekly summary for a parent about their child %s (age %d) who practised memory games this week. " +
            "They completed %d flashcard set(s), learned %d word(s) of the day, and played %d memory match game(s). " +
            "Only mention activities with a non-zero count. Be encouraging and specific. No markdown.",
            childName, age, flashcardSets, wordsLearned, matchGames);

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
            return childName + " practised memory games this week — great effort!";
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static final java.util.Set<String> BLOCKED_WORDS = java.util.Set.of(
        "death", "dead", "die", "kill", "murder", "suicide", "blood", "gore", "war",
        "bomb", "weapon", "gun", "knife", "stab", "shoot", "poison", "drug", "alcohol",
        "sex", "porn", "nude", "naked", "rape", "abuse", "scary", "horror", "demon",
        "devil", "hell", "curse", "hate", "racist", "slur", "bully"
    );

    private String capitalize(String word) {
        if (word == null || word.isEmpty()) return word;
        return Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase();
    }

    private boolean isWordSafeForAge(String word, int age) {
        String lower = word.toLowerCase();
        for (String blocked : BLOCKED_WORDS) {
            if (lower.contains(blocked)) return false;
        }
        // For young children (4-6), reject words over 8 characters as likely too complex
        if (age <= 6 && word.length() > 8) return false;
        return true;
    }

    private String stripCodeFences(String text) {
        return text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
    }
}
