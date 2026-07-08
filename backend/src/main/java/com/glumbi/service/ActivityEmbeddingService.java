package com.glumbi.service;

import com.glumbi.entity.Activity;
import com.glumbi.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityEmbeddingService {

    private final ActivityRepository repo;
    private final VoyageEmbeddingClient voyage;

    @Transactional
    public void embedAndSave(Activity activity) {
        if (!voyage.isConfigured()) {
            log.warn("[RAG] voyage.api-key not configured — skipping embedding for activity {}", activity.getId());
            return;
        }
        try {
            String vector = voyage.embed(buildText(activity));
            repo.updateEmbedding(activity.getId(), vector);
            log.debug("[RAG] Embedded activity {} for child {}", activity.getId(), activity.getChild().getId());
        } catch (Exception e) {
            log.error("[RAG] Failed to embed activity {}: {}", activity.getId(), e.getMessage());
        }
    }

    public List<Activity> findSimilarById(Long activityId, Long childId) {
        try {
            return repo.findSimilarByStoredEmbedding(childId, activityId, voyage.similarLimit);
        } catch (Exception e) {
            log.error("[RAG] Activity similarity failed for activity {}: {}", activityId, e.getMessage());
            return List.of();
        }
    }

    private String buildText(Activity a) {
        StringJoiner sj = new StringJoiner(" | ");
        if (a.getTitle()       != null) sj.add(a.getTitle());
        if (a.getDescription() != null) sj.add(a.getDescription());
        if (a.getCategory()    != null) sj.add(a.getCategory());
        return sj.toString();
    }
}
