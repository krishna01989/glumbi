package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReadQuizAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final RelevanceGuard relevance;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                 private String model;
    @Value("${anthropic.max-tokens.read-quiz}")  private int maxTokens;

    public ReadQuizResult generate(String childName, int childAge, String topic, String glumbiMemory) {
        relevance.validate(topic, RelevanceGuard.Context.STORY);
        safety.validateInput(topic);

        String agentPrompt = String.format(
                promptLoader.load("read-quiz-system"), childAge, readingGuidance(childAge));

        String prompt = String.format(promptLoader.load("read-quiz-user"),
                childName, childAge, topic, childAge);

        String glumbiInstructions = """
            Also return these Glumbi guide fields in the same JSON:
            - "glumbiIntro": one short enthusiastic line Glumbi says before the child reads (max 12 words, no spoilers, builds excitement)
            - "glumbiScoreComment0": Glumbi's warm comment if score is 0 (encouraging, not sad, max 15 words)
            - "glumbiScoreComment1": Glumbi's comment if score is 1 (encouraging, max 15 words)
            - "glumbiScoreComment2": Glumbi's comment if score is 2 (positive, max 15 words)
            - "glumbiScoreComment3": Glumbi's comment if score is 3 (celebrate!, max 15 words)
            """;

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens + 200);
        String memorySection = (glumbiMemory != null && !glumbiMemory.isBlank()) ? "\n\n" + glumbiMemory : "";
        body.putArray("messages").addObject().put("role", "user").put("content", prompt + "\n\n" + glumbiInstructions + memorySection);

        String response = anthropicClient.callWithCachedSystem(body, safety.safetySystemPreamble(), agentPrompt);

        return parseResponse(response, topic);
    }

    private String readingGuidance(int age) {
        if (age <= 5) return "Use very simple words and very short sentences (grade K–1). Focus on one clear idea with fun, repetitive language. Story length: 100–150 words.";
        if (age <= 7) return "Use simple but slightly varied vocabulary (grade 1–2). Clear cause-and-effect. Story length: 150–250 words.";
        if (age <= 9) return "Vocabulary should challenge slightly without overwhelming (grade 2–4). Use descriptive language and varied sentence structure. Story length: 250–350 words.";
        return "Use richer vocabulary and complex sentences (grade 4–6). Include subplots, character development, and deeper themes. Story length: 300–450 words.";
    }

    private ReadQuizResult parseResponse(String raw, String topic) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode node = mapper.readTree(text);

            Question[] questions = new Question[3];
            JsonNode qs = node.path("questions");
            for (int i = 0; i < 3 && i < qs.size(); i++) {
                JsonNode q = qs.get(i);
                String[] opts = new String[3];
                for (int j = 0; j < 3 && j < q.path("options").size(); j++) {
                    opts[j] = q.path("options").get(j).asText();
                }
                questions[i] = new Question(
                    q.path("question").asText(),
                    opts,
                    q.path("correctIndex").asInt(0)
                );
            }

            String glumbiIntro = node.path("glumbiIntro").asText("");
            String scoreComment = node.path("glumbiScoreComment0").asText("You gave it a great try!")
                + "|" + node.path("glumbiScoreComment1").asText("Nice work — you're learning!")
                + "|" + node.path("glumbiScoreComment2").asText("Wow, so close — brilliant!")
                + "|" + node.path("glumbiScoreComment3").asText("Perfect! You're a superstar! 🌟");

            return new ReadQuizResult(
                node.path("title").asText("A Reading Adventure"),
                node.path("story").asText(),
                node.path("readingTime").asText("5 mins"),
                node.path("lesson").asText("Curiosity"),
                questions, glumbiIntro, scoreComment
            );
        } catch (Exception e) {
            return fallback(topic);
        }
    }

    private ReadQuizResult fallback(String topic) {
        Question[] qs = {
            new Question(
                "What was the main character doing at the start?",
                new String[]{"Exploring", "Sleeping", "Eating"}, 0),
            new Question(
                "Why did the character feel nervous?",
                new String[]{"It was something new", "They were hungry", "It was too loud"}, 0),
            new Question(
                "What lesson does this story teach?",
                new String[]{"Try new things with courage", "Always stay home", "Never ask for help"}, 0)
        };
        return new ReadQuizResult(
            "The Big Adventure",
            safety.safeFallback("story"),
            "5 mins", "Courage", qs,
            "Ready to read? Let's go!",
            "You gave it a great try!|Nice work!|So close — brilliant!|Perfect! You're a superstar! 🌟"
        );
    }

    public record ReadQuizResult(String title, String story, String readingTime, String lesson, Question[] questions, String glumbiIntro, String glumbiScoreComment) {}
    public record Question(String question, String[] options, int correctIndex) {}
}
