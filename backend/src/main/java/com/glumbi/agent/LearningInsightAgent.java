package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Child;
import com.glumbi.entity.ReadQuizEntry;
import com.glumbi.entity.WritingEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LearningInsightAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                        private String model;
    @Value("${anthropic.max-tokens.learning-insight}")  private int maxTokens;

    public String generate(Child child, List<ReadQuizEntry> quizzes, List<WritingEntry> writings) {
        boolean hasQuizData   = quizzes.stream().anyMatch(ReadQuizEntry::isCompleted);
        boolean hasWritingData = writings.stream().anyMatch(WritingEntry::isFeedbackReceived);

        if (!hasQuizData && !hasWritingData) return null;

        String quizSummary = buildQuizSummary(quizzes);
        String writingSummary = buildWritingSummary(writings);

        try {
            String prompt = String.format(promptLoader.load("learning-insight-user"),
                    child.getName(), com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear()),
                    quizSummary, writingSummary);

            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.putArray("messages").addObject()
                    .put("role", "user").put("content", prompt);

            String response = anthropicClient.call(body);

            JsonNode root = mapper.readTree(response);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return null;
        }
    }

    private String buildQuizSummary(List<ReadQuizEntry> quizzes) {
        List<ReadQuizEntry> completed = quizzes.stream()
                .filter(ReadQuizEntry::isCompleted)
                .limit(6)
                .toList();

        if (completed.isEmpty()) return "no quizzes taken";

        String scores = completed.stream()
                .map(q -> q.getScore() + "/3")
                .collect(Collectors.joining(", "));

        double avg = completed.stream()
                .mapToInt(ReadQuizEntry::getScore)
                .average()
                .orElse(0);

        return String.format("scores: [%s], average: %.1f/3", scores, avg);
    }

    private String buildWritingSummary(List<WritingEntry> writings) {
        List<WritingEntry> withFeedback = writings.stream()
                .filter(WritingEntry::isFeedbackReceived)
                .limit(3)
                .toList();

        if (withFeedback.isEmpty()) return "no writing feedback yet";

        return withFeedback.stream()
                .map(w -> "suggestion: " + (w.getFeedbackSuggestion() != null ? w.getFeedbackSuggestion() : "n/a"))
                .collect(Collectors.joining(" | "));
    }
}
