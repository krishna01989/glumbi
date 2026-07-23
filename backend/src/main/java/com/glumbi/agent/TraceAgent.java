package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class TraceAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                    private String model;
    @Value("${anthropic.max-tokens.trace:500}")     private int maxTokens;

    public TraceLevel generate(String childName, int childAge, String difficulty,
                               String perfContext, int minCols, int maxCols, int minRows, int maxRows) {
        String prompt = String.format(promptLoader.load("trace-user"),
                childName, childAge, difficulty, perfContext,
                childName, childName, childName,
                childAge,
                minCols, maxCols, minRows, maxRows, childName);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);

        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "user").put("content", prompt);

        String response = anthropicClient.callWithCachedSystem(body,
                "You are a creative game designer for young children.");

        return parseResponse(response);
    }

    private TraceLevel parseResponse(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode node = mapper.readTree(text);

            JsonNode choicesNode = node.path("riddleChoices");
            int aiAnswer = node.path("riddleAnswer").asInt(0);
            String correctChoice = choicesNode.path(aiAnswer).asText("Option A");
            List<String> wrong = new ArrayList<>();
            for (int i = 0; i < 3; i++) {
                if (i != aiAnswer) wrong.add(choicesNode.path(i).asText("Option " + i));
            }
            Collections.shuffle(wrong, new Random());
            int correctPos = new Random().nextInt(3);
            List<String> choices = new ArrayList<>(wrong);
            choices.add(correctPos, correctChoice);

            return new TraceLevel(
                    node.path("theme").asText(),
                    node.path("startEmoji").asText("🐄"),
                    node.path("endEmoji").asText("🏚️"),
                    node.path("startLabel").asText("Cow"),
                    node.path("endLabel").asText("Barn"),
                    node.path("bgColor").asText("#e8f5e9"),
                    node.path("wallColor").asText("#388e3c"),
                    node.path("riddle").asText(""),
                    choices,
                    correctPos,
                    node.path("recommendedCols").asInt(0),
                    node.path("recommendedRows").asInt(0),
                    node.path("storyGreat").asText("What a perfect run! Maze champion! 🌟"),
                    node.path("storyOkay").asText("You made it! Great persistence! 🎉"),
                    node.path("storyStruggled").asText("You never gave up — that's a true winner! 🎉")
            );
        } catch (Exception e) {
            log.error("TraceAgent parse failed: {}", e.getMessage());
            return safeDefault();
        }
    }

    private TraceLevel safeDefault() {
        List<String> choices = new ArrayList<>(List.of("A cow 🐄", "A pig 🐷", "A horse 🐴"));
        String correct = choices.get(0);
        choices.remove(0);
        Collections.shuffle(choices, new Random());
        int pos = new Random().nextInt(3);
        choices.add(pos, correct);
        return new TraceLevel(
                "a cow walking home to its barn",
                "🐄", "🏚️", "Cow", "Barn",
                "#e8f5e9", "#388e3c",
                "I say moo and live on a farm — what am I?",
                choices,
                pos, 0, 0,
                "What a perfect run — maze champion! 🌟",
                "The cow made it home just in time for dinner! Great job! 🌙",
                "The cow finally found the way home — you never gave up, and that's the spirit! 🌙"
        );
    }

    public record TraceLevel(
            String theme,
            String startEmoji,
            String endEmoji,
            String startLabel,
            String endLabel,
            String bgColor,
            String wallColor,
            String riddle,
            List<String> riddleChoices,
            int riddleAnswer,
            int recommendedCols,
            int recommendedRows,
            String storyGreat,
            String storyOkay,
            String storyStruggled
    ) {}
}
