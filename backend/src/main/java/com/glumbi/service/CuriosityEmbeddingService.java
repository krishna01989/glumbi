package com.glumbi.service;

import com.glumbi.entity.CuriosityEntry;
import com.glumbi.repository.CuriosityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
public class CuriosityEmbeddingService {

    private final CuriosityRepository repo;
    private final VoyageEmbeddingClient voyage;

    @Transactional
    public void embedAndSave(CuriosityEntry entry) {
        if (!voyage.isAvailable()) {
            log.warn("[RAG] voyage.api-key not configured — skipping embedding for curiosity {}", entry.getId());
            return;
        }
        try {
            String vector = voyage.embed(buildText(entry));
            repo.updateEmbedding(entry.getId(), vector);
            log.debug("[RAG] Embedded curiosity {} for child {}", entry.getId(), entry.getChild().getId());
        } catch (Exception e) {
            log.error("[RAG] Failed to embed curiosity {}: {}", entry.getId(), e.getMessage());
        }
    }

    public List<CuriosityEntry> findSimilarById(Long entryId, Long childId) {
        try {
            return repo.findSimilarByStoredEmbedding(childId, entryId, voyage.similarLimit);
        } catch (Exception e) {
            log.error("[RAG] Curiosity similarity failed for entry {}: {}", entryId, e.getMessage());
            return List.of();
        }
    }

    private String buildText(CuriosityEntry e) {
        StringJoiner sj = new StringJoiner(" | ");
        if (e.getQuestion() != null) sj.add(e.getQuestion());
        if (e.getFunFact1() != null) sj.add(e.getFunFact1());
        return sj.toString();
    }
}
