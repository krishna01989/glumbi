package com.glumbi.service;

import com.glumbi.agent.JournalAgent;
import com.glumbi.dto.JournalRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.JournalEntry;
import com.glumbi.repository.FlashcardSetRepository;
import com.glumbi.repository.JournalRepository;
import com.glumbi.repository.MemoryMatchRepository;
import com.glumbi.repository.WordOfDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository repo;
    private final ChildService childService;
    private final JournalAgent journalAgent;
    private final FlashcardSetRepository flashcardRepo;
    private final WordOfDayRepository wordOfDayRepo;
    private final MemoryMatchRepository memoryMatchRepo;

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

    public JournalAgent.JournalResult generateAiEntry(Long childId) {
        Child child = childService.getByIdUnchecked(childId);
        int age = ChildService.ageFromBirthYear(child.getBirthYear());

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd   = LocalDate.now().atTime(LocalTime.MAX);

        List<String> summaries = new ArrayList<>();

        flashcardRepo.findByChildIdAndCreatedAtBetween(childId, todayStart, todayEnd)
            .forEach(fs -> summaries.add("Created flashcards on topic: " + fs.getTopic()));

        wordOfDayRepo.findByChildIdAndDate(childId, LocalDate.now())
            .ifPresent(w -> summaries.add("Learned the word of the day: \"" + w.getWord() + "\" (" + w.getMeaning() + ")"));

        memoryMatchRepo.findByChildIdAndCreatedAtBetween(childId, todayStart, todayEnd)
            .forEach(m -> summaries.add("Played a memory match game on theme: " + m.getTheme()));

        JournalAgent.JournalResult result = journalAgent.generateEntry(child.getName(), age, summaries);
        return result;
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
