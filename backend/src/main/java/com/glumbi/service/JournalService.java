package com.glumbi.service;

import com.glumbi.dto.JournalRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.JournalEntry;
import com.glumbi.repository.JournalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository repo;
    private final ChildService childService;

    public JournalEntry create(JournalRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());
        JournalEntry entry = new JournalEntry();
        entry.setChild(child);
        entry.setContent(req.getContent());
        entry.setMood(req.getMood());
        entry.setMilestone(req.getMilestone());
        return repo.save(entry);
    }

    public List<JournalEntry> getByChild(Long childId, LocalDateTime from, LocalDateTime to) {
        if (from != null && to != null) return repo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, from, to);
        return repo.findByChildIdOrderByCreatedAtDesc(childId);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
