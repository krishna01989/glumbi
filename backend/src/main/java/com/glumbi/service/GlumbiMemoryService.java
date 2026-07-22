package com.glumbi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.repository.ChildActivityEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds a compact Glumbi memory context string from a child's recent Glumbi interactions.
 * Only structured event data (choice text, topic) is used — never user-generated content.
 */
@Service
@RequiredArgsConstructor
public class GlumbiMemoryService {

    private final ChildActivityEventRepository repo;
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Returns a short context paragraph summarising the child's last few Glumbi interactions,
     * or an empty string if there are no prior events.
     */
    public String getMemoryContext(Long childId) {
        if (childId == null) return "";
        List<Object[]> rows = repo.findRecentGlumbiEvents(childId, 5);
        if (rows.isEmpty()) return "";

        List<String> lines = new ArrayList<>();
        for (Object[] row : rows) {
            String feature   = (String) row[0];
            String eventType = (String) row[1];
            String metadata  = (String) row[2];
            String line = formatEvent(feature, eventType, metadata);
            if (line != null) lines.add(line);
        }
        if (lines.isEmpty()) return "";

        return "Here are this child's recent Glumbi interactions (newest first — use these to make Glumbi feel personal and continuous):\n"
                + String.join("\n", lines);
    }

    private String formatEvent(String feature, String eventType, String metadata) {
        try {
            JsonNode m = mapper.readTree(metadata);
            return switch (eventType) {
                case "glumbi_mid_choice" -> {
                    String choiceText = m.path("choiceText").asText(null);
                    String title = m.path("storyTitle").asText(null);
                    if (choiceText == null) yield null;
                    yield "- In a story" + (title != null ? " (" + title + ")" : "") + ", they chose: \"" + choiceText + "\"";
                }
                case "glumbi_followup_choice" -> {
                    String choiceText = m.path("choiceText").asText(null);
                    String question = m.path("question").asText(null);
                    if (choiceText == null) yield null;
                    yield "- In Curiosity, Glumbi asked: \"" + (question != null ? question : "a follow-up question") + "\" — they answered: \"" + choiceText + "\"";
                }
                case "glumbi_ready" -> {
                    String topic = m.path("topic").asText(null);
                    String title = m.path("title").asText(null);
                    yield "- In Read & Quiz, they engaged with Glumbi on: " + (title != null ? title : (topic != null ? topic : "a quiz"));
                }
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }
}
