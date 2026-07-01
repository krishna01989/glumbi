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
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LearningInsightAgent {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api-key}")    private String apiKey;
    @Value("${anthropic.model}")      private String model;

    public String generate(Child child, List<ReadQuizEntry> quizzes, List<WritingEntry> writings) {
        boolean hasQuizData   = quizzes.stream().anyMatch(ReadQuizEntry::isCompleted);
        boolean hasWritingData = writings.stream().anyMatch(WritingEntry::isFeedbackReceived);

        if (!hasQuizData && !hasWritingData) return null;

        String quizSummary = buildQuizSummary(quizzes);
        String writingSummary = buildWritingSummary(writings);

        try {
            String prompt = String.format("""
                    You are a children's learning coach. Based on the following data about %s (age %d),
                    provide one specific, actionable insight for their parent.

                    Quiz performance (last 2 weeks): %s
                    Writing feedback highlights: %s

                    Write 2 sentences maximum. Be specific, constructive, and encouraging.
                    Focus on one concrete thing the parent can do to help.
                    Return only the insight text.
                    """,
                    child.getName(), com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear()), quizSummary, writingSummary);

            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", 150);
            body.putArray("messages").addObject()
                    .put("role", "user").put("content", prompt);

            String response = webClientBuilder.build()
                    .post().uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .bodyValue(body).retrieve().bodyToMono(String.class).block();

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
