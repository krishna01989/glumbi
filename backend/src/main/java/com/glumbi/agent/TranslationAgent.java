package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * TranslationAgent — translates an English story to a target language on demand.
 *
 * Translations are persisted on the Story entity (translationsJson) so the same
 * text is never re-translated. The English original is always the source of truth.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TranslationAgent {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.model}")                    private String model;
    @Value("${anthropic.max-tokens.translation}")   private int maxTokens;

    // Languages where the output must contain zero Latin/ASCII characters
    private static final java.util.Set<String> SCRIPT_PURE_LANGUAGES = java.util.Set.of(
            "tamil", "hindi", "malayalam", "telugu", "kannada",
            "chinese", "japanese", "korean"
    );

    public TranslationResult translate(String title, String content, String targetLanguage, int childAge, String childName) {
        String langName = resolveLangName(targetLanguage);

        String childNameNote = (childName != null && !childName.isBlank())
                ? "IMPORTANT: The child's name is \"" + childName + "\". This is a PROPER NAME — write it phonetically in "
                  + langName + " script. Do NOT translate its meaning — a name is how someone is called, not what it means.\n\n"
                : "";

        String prompt = childNameNote + String.format(promptLoader.load("translation-user"),
                langName, langName, childAge, langName, langName, langName, langName, langName,
                title, content);

        TranslationResult result = callClaude(prompt, title, content);

        // Post-translation validation: if any Latin letters leaked through for script-pure languages,
        // ask Claude to fix them rather than silently serving broken text to TTS.
        if (SCRIPT_PURE_LANGUAGES.contains(targetLanguage.toLowerCase())
                && containsLatin(result.title() + result.content())) {
            result = fixLatinLeakage(result, langName, targetLanguage, childAge);
        }

        return result;
    }

    public TranslationResult translate(String title, String content, String targetLanguage, int childAge) {
        return translate(title, content, targetLanguage, childAge, null);
    }

    public TranslationResult translate(String title, String content, String targetLanguage) {
        return translate(title, content, targetLanguage, 6, null);
    }

    private TranslationResult fixLatinLeakage(TranslationResult prev, String langName,
                                               String targetLanguage, int childAge) {
        String fixPrompt = String.format(
            "The following %s text for a %d-year-old child still contains Latin/English characters " +
            "which will break text-to-speech. Replace every Latin/English word or letter with its " +
            "phonetic equivalent written entirely in %s script. Return ONLY the corrected JSON: " +
            "{ \"title\": \"...\", \"content\": \"...\" }\n\n" +
            "{ \"title\": \"%s\", \"content\": \"%s\" }",
            langName, childAge, langName,
            escapeJson(prev.title()), escapeJson(prev.content())
        );

        log.warn("Latin leakage detected for {} — running fix-up", targetLanguage);
        TranslationResult fixed = callClaude(fixPrompt, prev.title(), prev.content());

        // If the fix-up itself still has Latin (unlikely), log and return original rather than loop
        if (containsLatin(fixed.title() + fixed.content())) {
            log.warn("Fix-up still contains Latin for {} — using pre-fix result", targetLanguage);
            return prev;
        }
        return fixed;
    }

    private TranslationResult callClaude(String prompt, String fallbackTitle, String fallbackContent) {
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", maxTokens);
            body.putArray("messages").addObject()
                    .put("role", "user").put("content", prompt);

            String response = anthropicClient.call(body);
            return parseResponse(response, fallbackTitle, fallbackContent);
        } catch (Exception e) {
            log.error("Translation Claude call failed: {}", e.getMessage());
            return new TranslationResult(fallbackTitle, fallbackContent);
        }
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

    private boolean containsLatin(String text) {
        return text != null && text.chars().anyMatch(c -> (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'));
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    private String resolveLangName(String lang) {
        return switch (lang.toLowerCase()) {
            case "tamil"     -> "Tamil (தமிழ்)";
            case "hindi"     -> "Hindi (हिंदी)";
            case "malayalam" -> "Malayalam (മലയാളം)";
            case "telugu"    -> "Telugu (తెలుగు)";
            case "kannada"   -> "Kannada (ಕನ್ನಡ)";
            case "spanish"   -> "Spanish (Español)";
            case "french"    -> "French (Français)";
            case "italian"   -> "Italian (Italiano)";
            case "chinese"   -> "Chinese (普通话)";
            case "japanese"  -> "Japanese (日本語)";
            case "korean"    -> "Korean (한국어)";
            default -> throw new IllegalArgumentException("Unsupported language: " + lang);
        };
    }

    public record TranslationResult(String title, String content) {}
}
