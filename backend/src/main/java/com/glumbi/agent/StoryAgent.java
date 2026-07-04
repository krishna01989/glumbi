package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StoryAgent {

    private final AnthropicClient anthropicClient;
    private final SafetyGuard safety;
    private final RelevanceGuard relevance;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")               private String model;
    @Value("${anthropic.max-tokens.story}")    private int maxTokens;

    public StoryResult generateStory(String childName, int childAge, String gender, String keywords) {
        relevance.validate(keywords, RelevanceGuard.Context.STORY);
        safety.validateInput(keywords);

        String pronoun = "girl".equalsIgnoreCase(gender) ? "she/her" : "he/him";

        String systemPrompt = safety.safetySystemPreamble() + String.format(
                promptLoader.load("story-system"),
                childName, childAge, pronoun, childName, pronoun, childAge, storyGuidance(childAge));

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.put("system", systemPrompt);
        body.putArray("messages").addObject().put("role", "user")
                .put("content", "Create a bedtime story using these elements: " + keywords);

        String response = anthropicClient.call(body);

        StoryResult result = parseResponse(response);
        if (!safety.isOutputSafe(result.content()))
            return new StoryResult("A Magical Story", safety.safeFallback("story"));
        return result;
    }

    public StoryResult continueStory(String childName, int childAge, String gender,
                                      String previousTitle, String previousContent) {
        String pronoun = "girl".equalsIgnoreCase(gender) ? "she/her" : "he/him";
        String snippet = previousContent.length() > 600
                ? previousContent.substring(previousContent.length() - 600) : previousContent;

        String systemPrompt = safety.safetySystemPreamble() + String.format(
                promptLoader.load("story-system"),
                childName, childAge, pronoun, childName, pronoun, childAge, storyGuidance(childAge));

        String userMsg = String.format(
                "Continue this story for %s. Here is what happened so far:\n\nTitle: %s\n\n...%s\n\n" +
                "Write the NEXT chapter. Keep the same characters and world. Give it a new chapter title.",
                childName, previousTitle, snippet);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.put("system", systemPrompt);
        body.putArray("messages").addObject().put("role", "user").put("content", userMsg);

        String response = anthropicClient.call(body);
        StoryResult result = parseResponse(response);
        if (!safety.isOutputSafe(result.content()))
            return new StoryResult("A Magical Story", safety.safeFallback("story"));
        return result;
    }

    private String storyGuidance(int age) {
        if (age <= 3) return "Very short sentences (5–8 words). Repetition is great. Only 1–2 characters. Focus on a single simple feeling or action. Max 100 words.";
        if (age <= 5) return "Short sentences, simple words. One small adventure with a clear beginning, middle, and happy end. 100–150 words.";
        if (age <= 7) return "Short paragraphs, gentle vocabulary. Include a small problem the character solves. 150–200 words.";
        if (age <= 9) return "More vivid descriptions, slightly richer vocabulary. A real problem and satisfying resolution. 180–220 words.";
        return "Engaging language, varied sentence structure. Multi-step plot with a meaningful ending. 200–250 words.";
    }

    private StoryResult parseResponse(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode story = mapper.readTree(text);
            String content = story.path("content").asText(text)
                    .replace("\\n", "\n").replace("\\\"", "\"");
            return new StoryResult(story.path("title").asText("A Magical Story"), content);
        } catch (Exception e) {
            return new StoryResult("A Magical Story", safety.safeFallback("story"));
        }
    }

    public record StoryResult(String title, String content) {}
}
