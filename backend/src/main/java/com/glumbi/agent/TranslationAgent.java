package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * TranslationAgent — translates English story text to Tamil or Hindi on demand.
 *
 * Translation is ephemeral — never stored. The English original is the source
 * of truth. This agent is called only when the user clicks "Listen in Tamil/Hindi".
 *
 * Agentic concept: single-purpose, stateless transformation agent.
 */
@Component
@RequiredArgsConstructor
public class TranslationAgent {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api-key}") private String apiKey;
    @Value("${anthropic.model}")   private String model;

    public TranslationResult translate(String title, String content, String targetLanguage) {
        String langName = switch (targetLanguage.toLowerCase()) {
            // Regional India
            case "tamil"     -> "Tamil (தமிழ்)";
            case "hindi"     -> "Hindi (हिंदी)";
            case "malayalam" -> "Malayalam (മലയാളം)";
            case "telugu"    -> "Telugu (తెలుగు)";
            case "kannada"   -> "Kannada (ಕನ್ನಡ)";
            // International
            case "spanish"   -> "Spanish (Español)";
            case "french"    -> "French (Français)";
            case "italian"   -> "Italian (Italiano)";
            case "chinese"   -> "Chinese (普通话)";
            case "japanese"  -> "Japanese (日本語)";
            case "korean"    -> "Korean (한국어)";
            default -> throw new IllegalArgumentException("Unsupported language: " + targetLanguage);
        };

        String prompt = String.format("""
            You are a native %s speaker translating a children's bedtime story for a young child.

            Translate the story below into natural, spoken %s — the kind a grandmother would tell at bedtime, not a textbook translation.

            Translation rules:
            - Use natural, colloquial %s — idioms, rhythm, and warmth that feel native, not word-for-word translated
            - Use simple vocabulary a young child would hear at home
            - Adapt cultural references naturally (e.g. "cookie" can become a familiar local sweet)
            - Keep the child's name exactly as-is — never translate or transliterate names
            - Preserve emotional warmth, wonder, and the gentle sleepy ending
            - Do NOT add any extra sentences or change the story meaning
            - Return ONLY a JSON object: { "title": "translated title", "content": "translated content" }

            Title: %s

            Story:
            %s
            """, langName, langName, langName, title, content);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 2048);
        body.putArray("messages").addObject()
                .put("role", "user").put("content", prompt);

        String response = webClientBuilder.build()
                .post().uri("https://api.anthropic.com/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .bodyValue(body).retrieve().bodyToMono(String.class).block();

        return parseResponse(response, title, content);
    }

    private TranslationResult parseResponse(String raw, String fallbackTitle, String fallbackContent) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode node = mapper.readTree(text);
            return new TranslationResult(
                    node.path("title").asText(fallbackTitle),
                    node.path("content").asText(fallbackContent).replace("\\n", "\n")
            );
        } catch (Exception e) {
            return new TranslationResult(fallbackTitle, fallbackContent);
        }
    }

    public record TranslationResult(String title, String content) {}
}
