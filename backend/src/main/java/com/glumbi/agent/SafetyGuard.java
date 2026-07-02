package com.glumbi.agent;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * SafetyGuard — three-layer content moderation for a kids app.
 *
 * Layer 1: Input filter  — block before hitting Claude (fast, cheap)
 * Layer 2: Prompt shield — embedded in every agent's system prompt
 * Layer 3: Output check  — scan Claude's response before returning
 *
 * Interview concept: Defense in depth. Never rely on a single check.
 * Claude is very safe but we still validate at every boundary.
 */
@Component
@RequiredArgsConstructor
public class SafetyGuard {

    private final PromptLoader promptLoader;

    // ── Layer 1: Input blocklist ──────────────────────────────────────────────
    // Patterns that should never reach Claude at all
    private static final List<Pattern> BLOCKED_INPUT_PATTERNS = List.of(
        // Violence
        Pattern.compile("\\b(kill|murder|shoot|stab|bomb|weapon|gun|knife|blood|gore|hurt|harm|die|dead|death|suicide)\\b", Pattern.CASE_INSENSITIVE),
        // Adult content
        Pattern.compile("\\b(sex|porn|nude|naked|adult|xxx|explicit|rape|abuse)\\b", Pattern.CASE_INSENSITIVE),
        // Drugs / alcohol
        Pattern.compile("\\b(drug|cocaine|heroin|marijuana|weed|alcohol|beer|wine|drunk|high|overdose)\\b", Pattern.CASE_INSENSITIVE),
        // Hate speech indicators
        Pattern.compile("\\b(hate|racist|racist|slur|discriminat)\\b", Pattern.CASE_INSENSITIVE),
        // Profanity (common ones — extend as needed)
        Pattern.compile("\\b(fuck|shit|ass|bitch|damn|crap|bastard|hell)\\b", Pattern.CASE_INSENSITIVE),
        // Personal data fishing
        Pattern.compile("\\b(password|credit.?card|social.?security|address|phone.?number)\\b", Pattern.CASE_INSENSITIVE),
        // Prompt injection attempts
        Pattern.compile("(ignore (previous|above|all) instructions|you are now|pretend you are|act as|jailbreak|dan mode)", Pattern.CASE_INSENSITIVE)
    );

    // ── Layer 3: Output blocklist ─────────────────────────────────────────────
    // If ANY of these appear in Claude's response, reject it
    private static final List<Pattern> BLOCKED_OUTPUT_PATTERNS = List.of(
        Pattern.compile("\\b(kill|murder|suicide|self.harm|overdose)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(sex|porn|nude|naked|explicit)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(fuck|shit|bitch)\\b", Pattern.CASE_INSENSITIVE)
    );

    /**
     * Layer 1: Validate user input BEFORE sending to Claude.
     * Throws SafetyException if input is not safe.
     */
    public void validateInput(String input) {
        if (input == null || input.isBlank()) {
            throw new SafetyException("Please type something first!");
        }
        if (input.length() > 500) {
            throw new SafetyException("Your message is too long. Please keep it shorter!");
        }
        // English-only: reject if >20% of chars are outside Basic Latin + Latin Extended
        long nonLatin = input.chars()
            .filter(c -> c > 0x024F && !Character.isWhitespace(c) && !Character.isDigit(c))
            .count();
        if (nonLatin > input.length() * 0.2) {
            throw new SafetyException("Please type in English only 🌟");
        }
        for (Pattern pattern : BLOCKED_INPUT_PATTERNS) {
            if (pattern.matcher(input).find()) {
                throw new SafetyException(
                    "Oops! That doesn't sound like something for our kids' app. " +
                    "Please try asking about something fun and friendly! 🌟"
                );
            }
        }
    }

    /**
     * Layer 2: Safety preamble to prepend to EVERY agent's system prompt.
     * This is the most important layer — it constrains Claude's behaviour.
     */
    public String safetySystemPreamble() {
        return promptLoader.load("safety-preamble");
    }

    /**
     * Layer 3: Scan Claude's output BEFORE returning it to the client.
     * Returns true if safe, false if it should be replaced with a fallback.
     */
    public boolean isOutputSafe(String output) {
        if (output == null || output.isBlank()) return false;
        for (Pattern pattern : BLOCKED_OUTPUT_PATTERNS) {
            if (pattern.matcher(output).find()) return false;
        }
        return true;
    }

    /**
     * A friendly fallback response when output fails safety check.
     */
    public String safeFallback(String context) {
        return switch (context) {
            case "story"    -> "Once upon a time, a friendly little bunny hopped through a magical meadow full of colourful flowers. Every flower had its own special smell, and the bunny stopped to sniff each one. At the end of the meadow, the bunny found a warm cosy burrow and snuggled in for the sweetest sleep.";
            case "activity" -> "Let's play with building blocks! Stack them as high as you can and see what shapes you can make.";
            case "curiosity"-> "The world is full of amazing things! Did you know butterflies taste with their feet? Nature is so wonderfully surprising!";
            default         -> "Let's think of something fun and friendly instead! 🌟";
        };
    }

    public static class SafetyException extends RuntimeException {
        public SafetyException(String message) { super(message); }
    }
}
