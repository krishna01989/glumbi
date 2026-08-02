package com.glumbi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.glumbi.agent.MemoryPlayAgent;
import com.glumbi.entity.Child;
import com.glumbi.entity.FlashcardSet;
import com.glumbi.entity.MemoryMatch;
import com.glumbi.entity.WordOfDay;
import com.glumbi.repository.FlashcardSetRepository;
import com.glumbi.repository.MemoryMatchRepository;
import com.glumbi.repository.WordOfDayRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MemoryPlayService {

    private final FlashcardSetRepository flashcardSetRepo;
    private final WordOfDayRepository wordOfDayRepo;
    private final MemoryMatchRepository memoryMatchRepo;
    private final MemoryPlayAgent agent;
    private final ChildService childService;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.cache.wotd-ttl-hours:25}")
    private int wotdTtlHours;

    // keyed by "childId:date" — expires after 25h so it always outlives the calendar day
    private Cache<String, WordOfDay> wotdCache;

    @PostConstruct
    void initCache() {
        wotdCache = Caffeine.newBuilder()
                .expireAfterWrite(wotdTtlHours, TimeUnit.HOURS)
                .maximumSize(500)
                .build();
    }

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

    public Page<FlashcardSet> getFlashcardSetsPaged(Long childId, Pageable pageable) {
        return flashcardSetRepo.findByChildIdOrderByCreatedAtDesc(childId, pageable);
    }

    public void deleteFlashcardSet(Long id) {
        flashcardSetRepo.deleteById(id);
    }

    // ── Word of Day ───────────────────────────────────────────────────────────
    /**
     * Returns the word for today if already generated, otherwise generates + saves + returns.
     * The returned result has fresh=true only when a new word was generated during this request.
     */
    public WordOfDayResult getOrGenerateWordOfDay(Long childId) {
        LocalDate today = LocalDate.now();
        String cacheKey = childId + ":" + today;

        // Cache stores only the WordOfDay entity
        WordOfDay cached = wotdCache.getIfPresent(cacheKey);
        if (cached != null) {
            return new WordOfDayResult(cached, false);
        }

        Optional<WordOfDay> existing = wordOfDayRepo.findByChildIdAndDate(childId, today);
        if (existing.isPresent()) {
            WordOfDay word = existing.get();
            wotdCache.put(cacheKey, word);
            return new WordOfDayResult(word, false);
        }

        Child child = childService.getByIdUnchecked(childId);
        int age = ChildService.ageFromBirthYear(child.getBirthYear());

        List<String> recentWords = wordOfDayRepo.findTop30ByChildIdOrderByDateDesc(childId)
                .stream()
                .map(WordOfDay::getWord)
                .toList();

        MemoryPlayAgent.WordResult agentResult =
                agent.generateWordOfDay(child.getName(), age, today, recentWords);

        if (agentResult == null) {
            return null;
        }

        WordOfDay word = new WordOfDay();
        word.setChild(child);
        word.setWord(agentResult.word());
        word.setMeaning(agentResult.meaning());
        word.setExampleSentence(agentResult.exampleSentence());
        word.setPronunciation(agentResult.pronunciation());
        word.setEmoji(agentResult.emoji());
        word.setDate(today);

        WordOfDay savedWord = wordOfDayRepo.save(word);

        // Cache the entity only
        wotdCache.put(cacheKey, savedWord);

        // Only this request is considered fresh
        return new WordOfDayResult(savedWord, true);
    }

    public record WordOfDayResult(WordOfDay word, boolean fresh) {}

    public List<WordOfDay> getWordOfDayHistory(Long childId) {
        return wordOfDayRepo.findByChildIdOrderByDateDesc(childId);
    }

    public Page<WordOfDay> getWordOfDayHistoryPaged(Long childId, Pageable pageable) {
        return wordOfDayRepo.findByChildIdOrderByDateDesc(childId, pageable);
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

    public Page<MemoryMatch> getMemoryMatchesPaged(Long childId, Pageable pageable) {
        return memoryMatchRepo.findByChildIdOrderByCreatedAtDesc(childId, pageable);
    }

    public void deleteMemoryMatch(Long id) {
        memoryMatchRepo.deleteById(id);
    }
}
