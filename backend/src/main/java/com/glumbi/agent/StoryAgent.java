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

    public StoryResult generateStory(String childName, int childAge, String gender, String keywords, String category, String glumbiMemory) {
        relevance.validate(keywords, RelevanceGuard.Context.STORY);
        safety.validateInput(keywords);

        String pronoun = "girl".equalsIgnoreCase(gender) ? "she/her" : "he/him";
        String[] cp = categoryPrompt(category);

        String agentPrompt = String.format(
                promptLoader.load("story-system"),
                cp[0], childName, childAge, pronoun, childName, pronoun, childAge, storyGuidance(childAge), cp[1]);

        String memorySection = (glumbiMemory != null && !glumbiMemory.isBlank())
                ? "\n\n" + glumbiMemory : "";
        String userContent = "Create a " + cp[2] + " using these elements: " + keywords
                + "\n\n" + glumbiGuideInstructions(childAge)
                + memorySection;

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens + 400); // extra budget for two branches
        body.putArray("messages").addObject().put("role", "user").put("content", userContent);

        String response = anthropicClient.callWithCachedSystem(body, safety.safetySystemPreamble(), agentPrompt);

        StoryResult result = parseResponse(response);
        if (!safety.isOutputSafe(result.content()))
            return new StoryResult("A Magical Story", safety.safeFallback("story"), "", "", "", "", "", "[]", "", "", "[]");
        return result;
    }

    public StoryResult continueStory(String childName, int childAge, String gender,
                                      String previousTitle, String previousContent, String category, String glumbiMemory) {
        String pronoun = "girl".equalsIgnoreCase(gender) ? "she/her" : "he/him";
        String snippet = previousContent.length() > 600
                ? previousContent.substring(previousContent.length() - 600) : previousContent;
        String[] cp = categoryPrompt(category);

        String agentPrompt = String.format(
                promptLoader.load("story-system"),
                cp[0], childName, childAge, pronoun, childName, pronoun, childAge, storyGuidance(childAge), cp[1]);

        String memorySection = (glumbiMemory != null && !glumbiMemory.isBlank())
                ? "\n\n" + glumbiMemory : "";
        String userMsg = String.format(
                "Continue this story for %s. Here is what happened so far:\n\nTitle: %s\n\n...%s\n\n" +
                "Write the NEXT chapter. Keep the same characters and world. " +
                "Give it a short new chapter title (just the chapter name, NOT the series title or any prefix)." +
                "\n\n" + glumbiGuideInstructions(childAge) +
                memorySection,
                childName, previousTitle, snippet);

        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", maxTokens + 400);
        body.putArray("messages").addObject().put("role", "user").put("content", userMsg);

        String response = anthropicClient.callWithCachedSystem(body, safety.safetySystemPreamble(), agentPrompt);
        StoryResult result = parseResponse(response);
        if (!safety.isOutputSafe(result.content()))
            return new StoryResult("A Magical Story", safety.safeFallback("story"), "", "", "", "", "", "[]", "", "", "[]");
        return result;
    }

    // Returns [taskDescription, endingRule, userMsgLabel] for the given category
    private String[] categoryPrompt(String category) {
        return switch (category == null ? "adventure" : category.toLowerCase()) {
            case "bedtime"    -> new String[]{
                "Write a short, calming bedtime story",
                "End with a gentle, sleepy conclusion that helps wind down",
                "calming bedtime story"};
            case "funny"      -> new String[]{
                "Write a short, silly and funny story",
                "End with a laugh — a funny twist, a joke, or a delightfully surprising moment",
                "silly funny story"};
            case "mystery"    -> new String[]{
                "Write a short mystery story",
                "End with a satisfying reveal — a clue discovered or a mystery solved",
                "mystery story"};
            case "friendship" -> new String[]{
                "Write a short story about friendship and kindness",
                "End with a warm moment of connection or a lesson about being a good friend",
                "friendship story"};
            case "nature"     -> new String[]{
                "Write a short story set in nature — forests, oceans, or animals",
                "End with wonder and appreciation for the natural world",
                "nature story"};
            case "space"      -> new String[]{
                "Write a short, imaginative space adventure story",
                "End with a sense of wonder about the universe and the stars",
                "space adventure story"};
            default           -> new String[]{
                "Write a short, fun adventure story",
                "End with a satisfying, uplifting conclusion — a resolution, a discovery, or a moment of joy",
                "fun adventure story"};
        };
    }

    private String storyGuidance(int age) {
        if (age <= 3) return "Very short sentences (5–8 words). Repetition is great. Only 1–2 characters. Focus on a single simple feeling or action. Max 100 words.";
        if (age <= 5) return "Short sentences, simple words. One small adventure with a clear beginning, middle, and happy end. 100–150 words.";
        if (age <= 7) return "Short paragraphs, gentle vocabulary. Include a small problem the character solves. 150–200 words.";
        if (age <= 9) return "More vivid descriptions, slightly richer vocabulary. A real problem and satisfying resolution. 180–220 words.";
        return "Engaging language, varied sentence structure. Multi-step plot with a meaningful ending. 200–250 words.";
    }

    private String glumbiGuideInstructions(int childAge) {
        return """
        Return a single JSON object with these fields:
        - "title": a short, imaginative story title (max 6 words)
        - "content": the full story text (complete narrative, all paragraphs)
        - "part1": the first half of the story, ending at a natural cliffhanger or tension point (NOT mid-sentence)
        - "glumbiIntro": one short enthusiastic line Glumbi says before the story starts. Age-appropriate, max 15 words. No spoilers.
        - "glumbiMidQuestion": one prediction question Glumbi asks after part1. Simple for age %d. No "I" statements.
        - "glumbiMidChoices": a JSON array of exactly 2 short answer choices (each max 6 words). These represent two genuinely different directions the story could go.
        - "part2a": the second half of the story if the child picks the FIRST choice. Must feel like a natural consequence of that choice.
        - "part2b": the second half of the story if the child picks the SECOND choice. Must feel meaningfully different from part2a — a genuinely different outcome, not just different wording.
        - "glumbiPostQuestion": one warm reflection question Glumbi asks after the full story ends. Focus on favourite moment or feeling.
        - "glumbiEpilogue": 2-3 sentences describing what the main character did the very next day. Warm, fun, conclusive. Works for both branches.
        - "vocabWords": a JSON array of exactly 3 words from the story. Each item: {"word": "...", "definition": "one simple sentence a %d year old can understand", "emoji": "one relevant emoji"}. Age guidance: age 3-4 = very common words the child almost knows (e.g. "journey", "brave"); age 5-6 = simple but slightly new words; age 7-8 = moderately enriching words; age 9+ = genuinely challenging vocabulary. Never pick abstract or complex words for children under 5.
        Keep all Glumbi lines warm, simple, and age-appropriate for a %d year old. Never ask about feelings directly.
        """.formatted(childAge, childAge, childAge);
    }

    private StoryResult parseResponse(String raw) {
        try {
            JsonNode root = mapper.readTree(raw);
            String text = root.path("content").get(0).path("text").asText();
            text = text.replaceAll("(?s)```[a-z]*\\s*", "").replaceAll("```", "").trim();
            JsonNode story = mapper.readTree(text);
            String content = story.path("content").asText("")
                    .replace("\\n", "\n").replace("\\\"", "\"");

            String part1  = story.path("part1").asText("").replace("\\n", "\n");
            String part2a = story.path("part2a").asText("").replace("\\n", "\n");
            String part2b = story.path("part2b").asText("").replace("\\n", "\n");

            // Fallback: if branching failed, split content and use the same text for both branches
            if (part1.isBlank() || part2a.isBlank() || part2b.isBlank()) {
                String[] halves = splitAtMidSentence(content);
                if (part1.isBlank())  part1  = halves[0];
                if (part2a.isBlank()) part2a = halves[1];
                if (part2b.isBlank()) part2b = halves[1];
            }

            String glumbiIntro        = story.path("glumbiIntro").asText("");
            String glumbiMidQuestion  = story.path("glumbiMidQuestion").asText("");
            String glumbiMidChoicesJson;
            JsonNode choicesNode = story.path("glumbiMidChoices");
            if (choicesNode.isArray()) {
                glumbiMidChoicesJson = choicesNode.toString();
            } else {
                glumbiMidChoicesJson = "[\"What happens next?\",\"Something unexpected!\"]";
            }
            String glumbiPostQuestion = story.path("glumbiPostQuestion").asText("");
            String glumbiEpilogue     = story.path("glumbiEpilogue").asText("").replace("\\n", "\n");

            JsonNode vocabNode = story.path("vocabWords");
            String vocabWordsJson = vocabNode.isArray() ? vocabNode.toString() : "[]";

            return new StoryResult(
                story.path("title").asText("A Magical Story"), content,
                part1, part2a, part2b,
                glumbiIntro, glumbiMidQuestion, glumbiMidChoicesJson,
                glumbiPostQuestion, glumbiEpilogue, vocabWordsJson
            );
        } catch (Exception e) {
            return new StoryResult("A Magical Story", safety.safeFallback("story"),
                "", "", "", "", "", "[]", "", "", "[]");
        }
    }

    /** Split content roughly in half at a sentence boundary. */
    private String[] splitAtMidSentence(String content) {
        if (content == null || content.isBlank()) return new String[]{"", ""};
        int mid = content.length() / 2;
        int split = -1;
        for (int i = mid; i < Math.min(content.length(), mid + 300); i++) {
            char c = content.charAt(i);
            if ((c == '.' || c == '!' || c == '?') && i + 1 < content.length() && content.charAt(i + 1) == ' ') {
                split = i + 1;
                break;
            }
        }
        if (split == -1) split = mid;
        return new String[]{ content.substring(0, split).trim(), content.substring(split).trim() };
    }

    public record StoryResult(
        String title, String content,
        String part1, String part2a, String part2b,
        String glumbiIntro, String glumbiMidQuestion, String glumbiMidChoices,
        String glumbiPostQuestion, String glumbiEpilogue,
        String vocabWordsJson
    ) {}
}
