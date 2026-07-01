package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glumbi.entity.Child;
import com.glumbi.entity.ReadQuizEntry;
import com.glumbi.entity.Story;
import com.glumbi.entity.WritingEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.OptionalDouble;

@Component
@RequiredArgsConstructor
public class ProgressReportAgent {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api-key}")    private String apiKey;
    @Value("${anthropic.model}")      private String model;

    public String generate(Child child, List<Story> stories, List<ReadQuizEntry> quizzes, List<WritingEntry> writings) {
        int storyCount = stories.size();
        int quizCount = (int) quizzes.stream().filter(ReadQuizEntry::isCompleted).count();
        int writingCount = writings.size();

        OptionalDouble avgScore = quizzes.stream()
                .filter(q -> q.getScore() != null)
                .mapToInt(ReadQuizEntry::getScore)
                .average();

        String scoreSummary = avgScore.isPresent()
                ? String.format("%.0f%%", (avgScore.getAsDouble() / 3.0) * 100)
                : "no quizzes completed";

        String prompt = String.format("""
                Write a warm, encouraging weekly progress summary for a parent about their child %s (age %d).
                This week's activity:
                - Stories read: %d
                - Quizzes completed: %d (average score: %s)
                - Writing entries: %d

                Write 2-3 friendly sentences. Be specific about the numbers. End with a positive note.
                Return only the message text, no JSON, no formatting.
                """,
                child.getName(), java.time.Period.between(child.getBirthDate(), java.time.LocalDate.now()).getYears(),
                storyCount, quizCount, scoreSummary, writingCount);

        return callClaude(prompt);
    }

    private String callClaude(String prompt) {
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", 200);
            body.putArray("messages").addObject()
                    .put("role", "user")
                    .put("content", prompt);

            String response = webClientBuilder.build()
                    .post().uri("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .bodyValue(body).retrieve().bodyToMono(String.class).block();

            JsonNode root = mapper.readTree(response);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return String.format("Great week for %s! Keep up the wonderful learning journey.", "your child");
        }
    }
}
