package com.glumbi.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * RelevanceGuard — Layer 0, runs before any main agent.
 *
 * Two-step approach:
 *   Step A: Fast regex blocklist for obvious off-topic patterns (no API cost)
 *   Step B: Claude classifier for subtle/ambiguous cases (one cheap API call)
 *
 * Interview concept: "Intent classification before execution."
 * This is how production AI systems stay focused — a cheap classifier
 * gates access to the expensive main agent.
 */
@Component
@RequiredArgsConstructor
public class RelevanceGuard {

    private final AnthropicClient anthropicClient;
    private final PromptLoader promptLoader;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.fast-model}")           private String fastModel;
    @Value("${anthropic.max-tokens.relevance}") private int maxTokens;

    public enum Context { STORY, CURIOSITY, ACTIVITY }

    // ── Step A: Fast regex for obviously off-topic inputs ─────────────────────
    private static final List<Pattern> OFF_TOPIC_PATTERNS = List.of(
        // Tech / system abuse
        Pattern.compile("\\b(root access|sudo|ssh|chmod|admin|system access|database|sql|api key|token|secret|env|config|server|backend|frontend|deploy|docker|kubernetes|linux|bash|shell|terminal|command|code|python|java|javascript|html|css|github|git)\\b", Pattern.CASE_INSENSITIVE),
        // Financial
        Pattern.compile("\\b(stock|market|invest|crypto|bitcoin|trading|finance|money|bank|loan|mortgage|portfolio|dividend|forex|nft)\\b", Pattern.CASE_INSENSITIVE),
        // Political / news
        Pattern.compile("\\b(politics|election|president|government|war|military|protest|congress|senate|republican|democrat|policy|law|court|judge)\\b", Pattern.CASE_INSENSITIVE),
        // Personal data extraction
        Pattern.compile("\\b(tell me your|reveal|show me|give me|expose|leak|dump|extract|what is your (system|prompt|instruction|rule|key|token))\\b", Pattern.CASE_INSENSITIVE),
        // Jailbreak / role override
        Pattern.compile("\\b(ignore|bypass|override|disable|remove|forget).{0,20}(rule|instruction|filter|guard|safety|restriction|limit)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(you are (now|a|an)|pretend|roleplay|simulate|act as|become|switch to|new persona|developer mode|god mode|unrestricted)\\b", Pattern.CASE_INSENSITIVE),
        // Adult relationships / dating
        Pattern.compile("\\b(dating|romance|boyfriend|girlfriend|marriage|divorce|relationship advice|hook up)\\b", Pattern.CASE_INSENSITIVE),
        // Medical / legal advice
        Pattern.compile("\\b(diagnose|prescription|medication|dosage|legal advice|lawsuit|sue|attorney|medical condition)\\b", Pattern.CASE_INSENSITIVE)
    );

    // Per-context: what topics ARE allowed (used in Claude classifier prompt)
    private static final String STORY_SCOPE =
        "children's story themes: animals, nature, adventure, friendship, magic, fantasy, " +
        "fairy tale characters, dinosaurs, space, ocean creatures, seasons, colours, toys, " +
        "food and cooking, vehicles and transport (trains, cars, rockets, boats), " +
        "school and teachers, sports and games, superheroes and superpowers, " +
        "robots and inventions, weather and sky, music and dance, art and painting, " +
        "pirates and treasure, castles and knights, fairies and elves, witches and wizards, " +
        "jungle and safari, farm animals, pets, underwater world, mountains and forests, " +
        "gardens and flowers, circus and carnival, holidays and celebrations, " +
        "family and siblings, helping others, feelings and emotions, dreams and imagination, " +
        "everyday objects coming to life, insects and bugs, birds, planets and stars, " +
        "mystery and detective stories (clues, secrets, solving puzzles, finding things), " +
        "silly and funny scenarios (jokes, pranks, silly characters, unexpected twists), " +
        "bedtime and sleep themes (stars, moon, cosy, nighttime, dreams, lullabies)";

    private static final String CURIOSITY_SCOPE =
        "child-friendly 'why' questions about: nature, animals, weather, space, human body basics, " +
        "plants, food, colours, sounds, everyday objects, simple science, geography basics";

    private static final String ACTIVITY_SCOPE =
        "toddler activity preferences: arts and crafts, outdoor play, indoor games, " +
        "learning through play, music, drawing, building, sensory activities";

    /**
     * Validates relevance of user input for a given context.
     * Throws RelevanceException with a friendly message if not relevant.
     */
    public void validate(String input, Context context) {
        // Step A — instant regex check (no API cost)
        for (Pattern p : OFF_TOPIC_PATTERNS) {
            if (p.matcher(input).find()) {
                throw new RelevanceException(friendlyMessage(context));
            }
        }

        // Step B — Claude classifier for subtle cases
        String classification = classify(input, context);
        if (!"RELEVANT".equalsIgnoreCase(classification)) {
            throw new RelevanceException(friendlyMessage(context));
        }
    }

    private String classify(String input, Context context) {
        // Story uses its own permissive prompt — imaginative/made-up kids' words must pass
        if (context == Context.STORY) {
            String prompt = String.format(promptLoader.load("relevance-guard-story-user"), input);
            try {
                ObjectNode body = mapper.createObjectNode();
                body.put("model", fastModel);
                body.put("max_tokens", maxTokens);
                body.putArray("messages").addObject().put("role", "user").put("content", prompt);
                String response = anthropicClient.call(body);
                JsonNode root = mapper.readTree(response);
                return root.path("content").get(0).path("text").asText("RELEVANT").trim();
            } catch (Exception e) {
                return "RELEVANT";
            }
        }

        String scope = switch (context) {
            case STORY     -> ""; // unreachable — handled above
            case CURIOSITY -> CURIOSITY_SCOPE;
            case ACTIVITY  -> ACTIVITY_SCOPE;
        };

        String prompt = String.format(promptLoader.load("relevance-guard-user"), scope, input);

        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", fastModel);
            body.put("max_tokens", maxTokens);

            ArrayNode messages = body.putArray("messages");
            messages.addObject().put("role", "user").put("content", prompt);

            String response = anthropicClient.call(body);

            JsonNode root = mapper.readTree(response);
            return root.path("content").get(0).path("text").asText("OFF_TOPIC").trim();

        } catch (Exception e) {
            // If classifier fails, fail safe — allow the request through
            // (better to let one bad request through than block all good ones)
            return "RELEVANT";
        }
    }

    private String friendlyMessage(Context context) {
        return switch (context) {
            case STORY ->
                "Hmm, that doesn't sound like a story idea! Try something like 'brave lion, jungle, adventure' 🦁";
            case CURIOSITY ->
                "That's not quite a question for our kids' explorer! Try asking something like 'Why do stars twinkle?' 🌟";
            case ACTIVITY ->
                "That doesn't look like an activity idea! We're here to find fun things for your little one to do 🎈";
        };
    }

    public static class RelevanceException extends RuntimeException {
        public RelevanceException(String message) { super(message); }
    }
}
