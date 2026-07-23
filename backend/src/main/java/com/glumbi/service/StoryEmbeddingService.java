package com.glumbi.service;

import com.glumbi.entity.Story;
import com.glumbi.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoryEmbeddingService {

    private final StoryRepository       storyRepository;
    private final VoyageEmbeddingClient voyage;

    @Transactional
    public void embedAndSave(Story story) {
        if (!voyage.isAvailable()) {
            log.warn("[RAG] voyage.api-key not configured — skipping embedding for story {}", story.getId());
            return;
        }
        try {
            String vector = voyage.embed(buildEmbedText(story));
            storyRepository.updateEmbedding(story.getId(), vector);
            log.debug("[RAG] Embedded story {} for child {}", story.getId(), story.getChild().getId());
        } catch (Exception e) {
            log.error("[RAG] Failed to embed story {}: {}", story.getId(), e.getMessage());
        }
    }

    /** Similarity using query text — calls Voyage AI. Use only at generate time. */
    public List<Story> findSimilar(Long childId, String queryText, Long excludeStoryId) {
        if (!voyage.isAvailable()) return List.of();
        try {
            String vector = voyage.embed(queryText);
            return storyRepository.findSimilarStories(childId, vector, excludeStoryId, voyage.similarLimit);
        } catch (Exception e) {
            log.error("[RAG] Similarity search failed for child {}: {}", childId, e.getMessage());
            return List.of();
        }
    }

    /** Similarity using a story's own stored embedding — no Voyage AI call. */
    public List<Story> findSimilarById(Long storyId, Long childId) {
        try {
            return storyRepository.findSimilarByStoredEmbedding(childId, storyId, voyage.similarLimit);
        } catch (Exception e) {
            log.error("[RAG] Stored-embedding similarity failed for story {}: {}", storyId, e.getMessage());
            return List.of();
        }
    }

    private String buildEmbedText(Story story) {
        StringJoiner sj = new StringJoiner(" | ");
        if (story.getTitle()    != null) sj.add(story.getTitle());
        if (story.getKeywords() != null) sj.add(story.getKeywords());
        if (story.getContent()  != null) sj.add(story.getContent().substring(0, Math.min(300, story.getContent().length())));
        return sj.toString();
    }
}
