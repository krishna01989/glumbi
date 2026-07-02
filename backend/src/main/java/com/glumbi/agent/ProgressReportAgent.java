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

import java.util.List;
import java.util.OptionalDouble;

@Component
@RequiredArgsConstructor
public class ProgressReportAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                        private String model;
    @Value("${anthropic.max-tokens.progress-report}")   private int maxTokens;

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

        String prompt = String.format(promptLoader.load("progress-report-user"),
                child.getName(), com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear()),
                storyCount, quizCount, scoreSummary, writingCount);

        return callClaude(prompt);
    }

    private String callClaude(String prompt) {
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.putArray("messages").addObject()
                    .put("role", "user")
                    .put("content", prompt);

            String response = anthropicClient.call(body);

            JsonNode root = mapper.readTree(response);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return String.format("Great week for %s! Keep up the wonderful learning journey.", "your child");
        }
    }
}
