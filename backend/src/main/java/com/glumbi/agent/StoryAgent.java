package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class StoryAgent {

    private final WebClient.Builder webClientBuilder;
    private final SafetyGuard safety;
    private final RelevanceGuard relevance;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api-key}")    private String apiKey;
    @Value("${anthropic.model}")      private String model;
    @Value("${anthropic.max-tokens}") private int maxTokens;

    public StoryResult generateStory(String childName, int childAge, String gender, String keywords) {
        relevance.validate(keywords, RelevanceGuard.Context.STORY);
        safety.validateInput(keywords);

        String pronoun = "girl".equalsIgnoreCase(gender) ? "she/her" : "he/him";

        String systemPrompt = safety.safetySystemPreamble() + String.format("""
            You are a warm, imaginative children's storyteller.
            Write a short bedtime story for %s who is %d years old (pronouns: %s).
            Rules:
            - Always use the child's name (%s) as the main character or their best friend
            - Use the correct pronouns (%s) consistently throughout
            - STRICT LENGTH: 150-200 words maximum — short enough to read in 2 minutes
            - Age guidance for %d year old: %s
            - End with a gentle, sleepy conclusion that helps wind down
            - Make it warm, safe, and magical — no scary elements
            - Do NOT pad with descriptions; every sentence must move the story forward
            Format your response as JSON: { "title": "...", "content": "..." }
            Return ONLY the JSON, no extra text.
            """, childName, childAge, pronoun, childName, pronoun, childAge, storyGuidance(childAge));

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 512);
        body.put("system", systemPrompt);
        body.putArray("messages").addObject().put("role", "user")
                .put("content", "Create a bedtime story using these elements: " + keywords);

        String response = webClientBuilder.build()
                .post().uri("https://api.anthropic.com/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .bodyValue(body).retrieve().bodyToMono(String.class).block();

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
