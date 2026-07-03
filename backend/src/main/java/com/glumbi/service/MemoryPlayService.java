package com.glumbi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.agent.MemoryPlayAgent;
import com.glumbi.entity.Child;
import com.glumbi.entity.FlashcardSet;
import com.glumbi.entity.MemoryMatch;
import com.glumbi.entity.WordOfDay;
import com.glumbi.repository.FlashcardSetRepository;
import com.glumbi.repository.MemoryMatchRepository;
import com.glumbi.repository.WordOfDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemoryPlayService {

    private final FlashcardSetRepository flashcardSetRepo;
    private final WordOfDayRepository wordOfDayRepo;
    private final MemoryMatchRepository memoryMatchRepo;
    private final MemoryPlayAgent agent;
    private final ChildService childService;
    private final ObjectMapper mapper = new ObjectMapper();

    // ── Flashcards ────────────────────────────────────────────────────────────

    public FlashcardSet generateFlashcards(Long childId, String topic) {
        Child child = childService.getByIdUnchecked(childId);
        int age = ChildService.ageFromBirthYear(child.getBirthYear());

        List<Map<String, String>> cards = agent.generateFlashcards(child.getName(), age, topic);

        FlashcardSet set = new FlashcardSet();
        set.setChild(child);
        set.setTopic(topic);
        try {
            set.setCards(mapper.writeValueAsString(cards));
        } catch (Exception e) {
            set.setCards("[]");
        }
        return flashcardSetRepo.save(set);
    }

    public List<FlashcardSet> getFlashcardSets(Long childId) {
        return flashcardSetRepo.findTop20ByChildIdOrderByCreatedAtDesc(childId);
    }

    public void deleteFlashcardSet(Long id) {
        flashcardSetRepo.deleteById(id);
    }

    // ── Word of Day ───────────────────────────────────────────────────────────

    /**
     * Returns the word for today if already generated, otherwise generates + saves + returns.
     * The returned map has a "fresh" boolean so the controller can decide whether to consume quota.
     */
    public WordOfDayResult getOrGenerateWordOfDay(Long childId) {
        LocalDate today = LocalDate.now();
        Optional<WordOfDay> existing = wordOfDayRepo.findByChildIdAndDate(childId, today);
        if (existing.isPresent()) {
            return new WordOfDayResult(existing.get(), false);
        }

        Child child = childService.getByIdUnchecked(childId);
        int age = ChildService.ageFromBirthYear(child.getBirthYear());

        MemoryPlayAgent.WordResult result = agent.generateWordOfDay(child.getName(), age);

        WordOfDay word = new WordOfDay();
        word.setChild(child);
        word.setWord(result.word());
        word.setMeaning(result.meaning());
        word.setExampleSentence(result.exampleSentence());
        word.setPronunciation(result.pronunciation());
        word.setEmoji(result.emoji());
        word.setDate(today);

        return new WordOfDayResult(wordOfDayRepo.save(word), true);
    }

    public record WordOfDayResult(WordOfDay word, boolean fresh) {}

    public List<WordOfDay> getWordOfDayHistory(Long childId) {
        return wordOfDayRepo.findByChildIdOrderByDateDesc(childId);
    }

    // ── Memory Match ──────────────────────────────────────────────────────────

    public MemoryMatch generateMemoryMatch(Long childId, String theme) {
        Child child = childService.getByIdUnchecked(childId);
        int age = ChildService.ageFromBirthYear(child.getBirthYear());

        List<Map<String, String>> pairs = agent.generateMatchPairs(child.getName(), age, theme);

        MemoryMatch match = new MemoryMatch();
        match.setChild(child);
        match.setTheme(theme);
        try {
            match.setPairs(mapper.writeValueAsString(pairs));
        } catch (Exception e) {
            match.setPairs("[]");
        }
        return memoryMatchRepo.save(match);
    }

    public List<MemoryMatch> getMemoryMatches(Long childId) {
        return memoryMatchRepo.findTop10ByChildIdOrderByCreatedAtDesc(childId);
    }

    public void deleteMemoryMatch(Long id) {
        memoryMatchRepo.deleteById(id);
    }
}
