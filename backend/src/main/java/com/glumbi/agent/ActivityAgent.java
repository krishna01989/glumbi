package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.List;

/**
 * ActivityAgent — generates age-appropriate activity suggestions.
 *
 * Agentic pattern: context-aware generation. The agent receives
 * environmental context (time of day, weather, child age, past ratings)
 * and reasons about what would work best RIGHT NOW for this specific child.
 *
 * This is different from the StoryAgent — it's personalization over time.
 * The more activities a parent rates, the better the suggestions get.
 */
@Component
@RequiredArgsConstructor
public class ActivityAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                private String model;
    @Value("${anthropic.max-tokens.activity}")  private int maxTokens;

    public List<ActivityResult> generateActivities(
            String childName, int childAge,
            String timeOfDay, String weather,
            String pastHighRatedActivities,
            int count) {

        String prompt = String.format(promptLoader.load("activity-user"),
                count, count == 1 ? "y" : "ies",
                childName, childAge, timeOfDay, weather,
                pastHighRatedActivities.isEmpty() ? "none yet" : pastHighRatedActivities,
                childAge, ageGuidance(childAge), count, count == 1 ? "" : "s");

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);

        ArrayNode messages = body.putArray("messages");
        messages.addObject().put("role", "user").put("content", prompt);

        String response = anthropicClient.callWithCachedSystem(body,
                safety.safetySystemPreamble(),
                "You are a cheerful children's activity planner.");

        return parseResponse(response);
    }

    private String ageGuidance(int age) {
        if (age <= 3) return "Very simple, sensory-based activities (water play, finger painting, stacking). Short attention span — keep under 10 mins. Parent must participate.";
        if (age <= 5) return "Simple creative and imaginative play (drawing, dress-up, simple puzzles, playdough). Can follow 2-step instructions. 10–20 min activities.";
        if (age <= 7) return "Structured activities with a clear goal (craft projects, simple board games, outdoor games, baking with help). Can read simple instructions. 20–30 min activities.";
        if (age <= 9) return "More complex projects (building models, science experiments, strategy games, team sports, reading challenges). Can work somewhat independently. 30–45 min activities.";
        return "Engaging challenges (coding puzzles, art projects, cooking full recipes, competitive games, journaling). Can self-direct with minimal supervision.";
    }

    private List<ActivityResult> parseResponse(String raw) {
        List<ActivityResult> results = new ArrayList<>();
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();

            JsonNode arr = mapper.readTree(text);
            for (JsonNode node : arr) {
                results.add(new ActivityResult(
                        node.path("title").asText(),
                        node.path("description").asText(),
                        node.path("category").asText("indoor"),
                        node.path("duration").asText("15 mins"),
                        node.path("emoji").asText("🎯")
                ));
            }
        } catch (Exception e) {
            results.add(new ActivityResult("Free Play", "Let your child explore freely with their favourite toys.", "indoor", "15 mins", "🧸"));
        }
        return results;
    }

    public record ActivityResult(String title, String description, String category, String duration, String emoji) {}
}
