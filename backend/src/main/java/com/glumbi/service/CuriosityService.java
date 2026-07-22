package com.glumbi.service;

import com.glumbi.agent.CuriosityAgent;
import com.glumbi.dto.CuriosityRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.CuriosityEntry;
import com.glumbi.repository.CuriosityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;

@Service
@RequiredArgsConstructor
public class CuriosityService {

    private final CuriosityRepository    repo;
    private final ChildService           childService;
    private final CuriosityAgent         agent;
    private final CuriosityEmbeddingService embeddingService;
    private final GlumbiMemoryService    glumbiMemory;
    @Qualifier("embeddingExecutor") private final ExecutorService embeddingExecutor;

    public CuriosityEntry explain(CuriosityRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());
        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        String memory = glumbiMemory.getMemoryContext(child.getId());
        CuriosityAgent.CuriosityResult result = agent.explain(req.getQuestion(), child.getName(), age, memory);

        CuriosityEntry entry = new CuriosityEntry();
        entry.setChild(child);
        entry.setQuestion(req.getQuestion());
        entry.setFunFact1(result.funFact1());
        entry.setFunFact2(result.funFact2());
        entry.setFunFact3(result.funFact3());
        entry.setQuizQuestion(result.quizQuestion());
        entry.setQuizAnswer(result.quizAnswer());
        entry.setQuizOption1(result.quizOption1());
        entry.setQuizOption2(result.quizOption2());
        entry.setQuizOption3(result.quizOption3());
        entry.setSticker(result.sticker());
        entry.setGlumbiFollowUp(result.glumbiFollowUp());
        entry.setGlumbiFollowUpChoices(result.glumbiFollowUpChoices());
        entry.setGlumbiReaction(result.glumbiReaction());
        CuriosityEntry saved = repo.save(entry);

        CompletableFuture.runAsync(() -> embeddingService.embedAndSave(saved), embeddingExecutor);

        return saved;
    }

    public List<CuriosityEntry> findSimilar(Long entryId) {
        CuriosityEntry entry = repo.findById(entryId).orElseThrow(() -> new RuntimeException("Entry not found: " + entryId));
        return embeddingService.findSimilarById(entryId, entry.getChild().getId());
    }

    public List<CuriosityEntry> getByChild(Long childId, LocalDateTime from, LocalDateTime to) {
        if (from != null && to != null)
            return repo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, from, to);
        return repo.findByChildIdOrderByCreatedAtDesc(childId);
    }

    public Page<CuriosityEntry> getByChildPaged(Long childId, Pageable pageable) {
        return repo.findByChildIdOrderByCreatedAtDesc(childId, pageable);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
