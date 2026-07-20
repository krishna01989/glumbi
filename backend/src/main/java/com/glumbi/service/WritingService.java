package com.glumbi.service;

import com.glumbi.agent.WritingCoachAgent;
import com.glumbi.dto.WritingRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.WritingEntry;
import com.glumbi.repository.WritingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WritingService {

    private final WritingRepository repo;
    private final ChildService childService;
    private final WritingCoachAgent agent;

    public WritingEntry save(WritingRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());

        // Check if updating an existing draft (same child + title within last hour)
        WritingEntry entry = new WritingEntry();
        entry.setChild(child);
        entry.setTitle(req.getTitle());
        entry.setContent(req.getContent());
        entry.setParentStoryId(req.getParentStoryId());
        entry.setSeriesId(req.getSeriesId());
        return repo.save(entry);
    }

    public WritingEntry update(Long id, WritingRequest req) {
        WritingEntry entry = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Writing not found"));
        entry.setTitle(req.getTitle());
        entry.setContent(req.getContent());
        entry.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
        // Clear old feedback when content is updated
        entry.setFeedbackReceived(false);
        entry.setFeedbackPraise(null);
        entry.setFeedbackSuggestion(null);
        entry.setFeedbackEncouragement(null);
        entry.setStarWord(null);
        entry.setBadge(null);
        return repo.save(entry);
    }

    public WritingEntry getFeedback(Long id) {
        WritingEntry entry = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Writing not found"));

        Child child = entry.getChild();
        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        WritingCoachAgent.CoachResult result =
            agent.getFeedback(child.getName(), age, entry.getTitle(), entry.getContent());

        entry.setFeedbackPraise(result.praise());
        entry.setFeedbackSuggestion(result.suggestion());
        entry.setFeedbackEncouragement(result.encouragement());
        entry.setStarWord(result.starWord());
        entry.setBadge(result.badge());
        entry.setFeedbackReceived(true);
        return repo.save(entry);
    }

    public List<WritingEntry> getByChild(Long childId, LocalDateTime from, LocalDateTime to) {
        if (from != null && to != null)
            return repo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, from, to);
        return repo.findByChildIdOrderByCreatedAtDesc(childId);
    }

    public Page<WritingEntry> getByChildPaged(Long childId, Pageable pageable) {
        return repo.findByChildIdOrderByCreatedAtDesc(childId, pageable);
    }

    @org.springframework.transaction.annotation.Transactional
    public boolean delete(Long id) {
        List<WritingEntry> chapters = repo.findBySeriesId(id);
        boolean hasSeries = !chapters.isEmpty();
        if (hasSeries) repo.deleteBySeriesId(id);
        repo.deleteById(id);
        return hasSeries;
    }
}
