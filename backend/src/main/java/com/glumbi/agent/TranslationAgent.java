package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                    private String model;
    @Value("${anthropic.max-tokens.translation}")   private int maxTokens;

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

        String prompt = String.format(promptLoader.load("translation-user"),
                langName, langName, langName, title, content);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens);
        body.putArray("messages").addObject()
                .put("role", "user").put("content", prompt);

        String response = anthropicClient.call(body);

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
