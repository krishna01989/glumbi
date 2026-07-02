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

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MilestoneAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                 private String model;
    @Value("${anthropic.max-tokens.milestone}")  private int maxTokens;

    private static final int[] STORY_MILESTONES  = {1, 5, 10, 25, 50};
    private static final int[] QUIZ_MILESTONES   = {1, 5, 10, 25};
    private static final int[] WRITING_MILESTONES = {1, 3, 5, 10};

    public List<String> detectAndGenerate(Child child,
                                          List<Story> allStories,
                                          List<ReadQuizEntry> allQuizzes,
                                          List<WritingEntry> allWritings) {
        List<String> messages = new ArrayList<>();

        int stories  = allStories.size();
        int quizzes  = (int) allQuizzes.stream().filter(ReadQuizEntry::isCompleted).count();
        int writings = allWritings.size();

        for (int m : STORY_MILESTONES) {
            if (stories == m) messages.add(generate(child, "stories read", m, "📖"));
        }
        for (int m : QUIZ_MILESTONES) {
            if (quizzes == m) messages.add(generate(child, "quizzes completed", m, "🎯"));
        }
        for (int m : WRITING_MILESTONES) {
            if (writings == m) messages.add(generate(child, "stories written", m, "✍️"));
        }

        // Perfect quiz streak — 3 or more consecutive perfect scores
        long perfectStreak = countPerfectStreak(allQuizzes);
        if (perfectStreak >= 3 && perfectStreak % 3 == 0) {
            messages.add(generate(child, "perfect quiz scores in a row", (int) perfectStreak, "🏆"));
        }

        return messages;
    }

    private long countPerfectStreak(List<ReadQuizEntry> quizzes) {
        long streak = 0;
        for (ReadQuizEntry q : quizzes) {
            if (q.isCompleted() && Integer.valueOf(3).equals(q.getScore())) streak++;
            else break;
        }
        return streak;
    }

    private String generate(Child child, String achievement, int count, String emoji) {
        try {
            String prompt = String.format(promptLoader.load("milestone-user"),
                    child.getName(), count, achievement, emoji, emoji);

            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.putArray("messages").addObject()
                    .put("role", "user").put("content", prompt);

            String response = anthropicClient.call(body);

            JsonNode root = mapper.readTree(response);
            return root.path("content").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return String.format("%s %s just reached %d %s — amazing!", "🎉", child.getName(), count, achievement);
        }
    }
}
