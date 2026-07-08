package com.glumbi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.entity.Story;
import com.glumbi.repository.StoryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

@Slf4j
@Service
public class StoryEmbeddingService {

    private final StoryRepository storyRepository;
    private final ObjectMapper    objectMapper;
    private final WebClient       webClient;

    @Value("${voyage.api-key:}")       private String voyageApiKey;
    @Value("${voyage.embed-url}")      private String embedUrl;
    @Value("${voyage.model}")          private String embedModel;
    @Value("${voyage.dimensions}")     private int    dimensions;
    @Value("${voyage.similar-limit}")  private int    similarLimit;

    public StoryEmbeddingService(StoryRepository storyRepository, ObjectMapper objectMapper, WebClient.Builder builder) {
        this.storyRepository = storyRepository;
        this.objectMapper    = objectMapper;
        this.webClient       = builder.build();
    }

    /**
     * Generates an embedding for the story's title + keywords + first 300 chars of content,
     * then persists it on the story row. Called async after a story is saved.
     */
    @Transactional
    public void embedAndSave(Story story) {
        if (voyageApiKey == null || voyageApiKey.isBlank()) {
            log.warn("[RAG] voyage.api-key not configured — skipping embedding for story {}", story.getId());
            return;
        }
        try {
            String text   = buildEmbedText(story);
            String vector = fetchEmbedding(text);
            storyRepository.updateEmbedding(story.getId(), vector);

            log.debug("[RAG] Embedded story {} for child {}", story.getId(), story.getChild().getId());
        } catch (Exception e) {
            log.error("[RAG] Failed to embed story {}: {}", story.getId(), e.getMessage());
            // Non-fatal — story is saved, just without embedding
        }
    }

    /**
     * Similarity search using a query text — calls Voyage AI to embed it.
     * Use only at story generate time when no stored embedding exists yet.
     */
    public List<Story> findSimilar(Long childId, String queryText, Long excludeStoryId) {
        if (voyageApiKey == null || voyageApiKey.isBlank()) return List.of();
        try {
            String vector = fetchEmbedding(queryText);
            return storyRepository.findSimilarStories(childId, vector, excludeStoryId, similarLimit);
        } catch (Exception e) {
            log.error("[RAG] Similarity search failed for child {}: {}", childId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Similarity search using a story's own stored embedding — no Voyage AI call.
     * Use this for all post-generate lookups (history navigation, similar story clicks).
     */
    public List<Story> findSimilarById(Long storyId, Long childId) {
        try {
            return storyRepository.findSimilarByStoredEmbedding(childId, storyId, similarLimit);
        } catch (Exception e) {
            log.error("[RAG] Stored-embedding similarity failed for story {}: {}", storyId, e.getMessage());
            return List.of();
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private String buildEmbedText(Story story) {
        StringJoiner sj = new StringJoiner(" | ");
        if (story.getTitle()    != null) sj.add(story.getTitle());
        if (story.getKeywords() != null) sj.add(story.getKeywords());
        if (story.getContent()  != null) sj.add(story.getContent().substring(0, Math.min(300, story.getContent().length())));
        return sj.toString();
    }

    private String fetchEmbedding(String text) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
            "model", embedModel,
            "input", List.of(text)
        ));

        String response = webClient.post()
            .uri(embedUrl)
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + voyageApiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        JsonNode root       = objectMapper.readTree(response);
        JsonNode embedding  = root.path("data").get(0).path("embedding");

        // Convert JSON array [0.1, 0.2, ...] to pgvector string "[0.1,0.2,...]"
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding.get(i).asDouble());
        }
        sb.append("]");
        return sb.toString();
    }
}
