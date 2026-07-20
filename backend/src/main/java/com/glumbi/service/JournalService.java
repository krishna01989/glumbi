package com.glumbi.service;

import com.glumbi.agent.JournalAgent;
import com.glumbi.dto.JournalRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.JournalEntry;
import com.glumbi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
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
    private final StoryRepository storyRepo;
    private final CuriosityRepository curiosityRepo;
    private final ReadQuizRepository readQuizRepo;
    private final WritingRepository writingRepo;
    private final ActivityRepository activityRepo;
    private final DrawSaveRepository drawSaveRepo;
    private final ChildActivityEventRepository eventRepo;

    // Lower tier = higher priority in the highlights reel
    private record Highlight(int tier, String summary) {}

    private static final int MAX_HIGHLIGHTS = 6;

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

    public Page<JournalEntry> getByChildPaged(Long childId, Pageable pageable) {
        return repo.findByChildIdOrderByCreatedAtDesc(childId, pageable);
    }

    public JournalAgent.JournalResult generateAiEntry(Long childId, String selectedMood) {
        Child child = childService.getByIdUnchecked(childId);
        int age = ChildService.ageFromBirthYear(child.getBirthYear());

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd   = LocalDate.now().atTime(LocalTime.MAX);

        List<Highlight> highlights = new ArrayList<>();

        // Tier 1 — completions & achievements (most journal-worthy)

        // Read & Quiz completed today — show score for richness
        readQuizRepo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, todayStart, todayEnd)
            .stream().filter(q -> q.isCompleted()).findFirst()
            .ifPresent(q -> {
                String score = q.getScore() != null ? " and scored " + q.getScore() + "/3" : "";
                highlights.add(new Highlight(1, "Completed a read & quiz on \"" + q.getTitle() + "\"" + score));
            });

        // Writing with AI feedback
        writingRepo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, todayStart, todayEnd)
            .stream().filter(w -> w.isFeedbackReceived()).findFirst()
            .ifPresent(w -> highlights.add(new Highlight(1,
                "Wrote a story called \"" + w.getTitle() + "\" and got AI feedback" +
                (w.getBadge() != null && !w.getBadge().isBlank() ? " (earned badge: " + w.getBadge() + ")" : ""))));

        // Activities completed
        activityRepo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, todayStart, todayEnd)
            .stream().filter(a -> Boolean.TRUE.equals(a.getCompleted())).findFirst()
            .ifPresent(a -> highlights.add(new Highlight(1,
                "Completed a " + a.getCategory() + " activity: \"" + a.getTitle() + "\"")));

        // Tier 2 — new learning & discovery

        // Word of the day
        wordOfDayRepo.findByChildIdAndDate(childId, LocalDate.now())
            .ifPresent(w -> highlights.add(new Highlight(2,
                "Learned the word of the day: \"" + w.getWord() + "\" (" + w.getMeaning() + ")")));

        // Curiosity question — the question itself is the most interesting part
        curiosityRepo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, todayStart, todayEnd)
            .stream().findFirst()
            .ifPresent(c -> highlights.add(new Highlight(2,
                "Asked a curiosity question: \"" + c.getQuestion() + "\"")));

        // Stories read/generated — use keywords for colour
        storyRepo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, todayStart, todayEnd)
            .stream().findFirst()
            .ifPresent(s -> {
                String detail = s.getKeywords() != null && !s.getKeywords().isBlank()
                    ? " (about: " + s.getKeywords() + ")" : "";
                highlights.add(new Highlight(2, "Read a story called \"" + s.getTitle() + "\"" + detail));
            });

        // Flashcards — one per unique topic
        flashcardRepo.findByChildIdAndCreatedAtBetween(childId, todayStart, todayEnd)
            .stream().findFirst()
            .ifPresent(fs -> highlights.add(new Highlight(2,
                "Created flashcards on topic: \"" + fs.getTopic() + "\"")));

        // Memory match — one game summary
        memoryMatchRepo.findByChildIdAndCreatedAtBetween(childId, todayStart, todayEnd)
            .stream().findFirst()
            .ifPresent(m -> highlights.add(new Highlight(2,
                "Played a memory match game on theme: " + m.getTheme())));

        // Tier 3 — practice & creative effort

        // Learn to Write practice (no entity — count from analytics events)
        long learnPractices = eventRepo.countByChildFeatureEventType(childId, "learn", "practice", todayStart);
        long learnWords     = eventRepo.countByChildFeatureEventType(childId, "learn", "ai_word",  todayStart);
        if (learnPractices > 0 || learnWords > 0) {
            String detail = learnWords > 0
                ? "practiced writing words" : "practiced writing letters";
            highlights.add(new Highlight(3, "Spent time in Learn to Write — " + detail));
        }

        // Drawing saved today
        drawSaveRepo.findByChildIdOrderByUpdatedAtDesc(childId)
            .stream()
            .filter(d -> !d.getUpdatedAt().isBefore(todayStart))
            .findFirst()
            .ifPresent(d -> highlights.add(new Highlight(3,
                "Created a drawing" + (d.getTitle() != null && !d.getTitle().isBlank() ? ": \"" + d.getTitle() + "\"" : ""))));

        // Sort by tier, then cap at MAX_HIGHLIGHTS
        highlights.sort(Comparator.comparingInt(Highlight::tier));
        List<String> summaries = highlights.stream()
            .limit(MAX_HIGHLIGHTS)
            .map(Highlight::summary)
            .toList();

        return journalAgent.generateEntry(child.getName(), age, summaries, selectedMood);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
