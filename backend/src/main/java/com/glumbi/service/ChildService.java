package com.glumbi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.dto.ChildRequest;
import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository       repo;
    private final UserRepository        userRepo;
    private final StoryRepository       storyRepository;
    private final ActivityRepository    activityRepository;
    private final JournalRepository     journalRepository;
    private final CuriosityRepository   curiosityRepository;
    private final ReadQuizRepository    readQuizRepository;
    private final WritingRepository     writingRepository;
    private final FlashcardSetRepository flashcardSetRepository;
    private final MemoryMatchRepository memoryMatchRepository;
    private final WordOfDayRepository   wordOfDayRepository;
    private final NotificationRepository notificationRepository;
    private final AiUsageLogRepository  aiUsageLogRepository;
    private final R2Service             r2Service;
    private final ObjectMapper          objectMapper;

    public List<Child> getByOwner(Long ownerId) {
        return repo.findByOwnerId(ownerId);
    }

    public Child getById(Long id, Long ownerId) {
        return repo.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new RuntimeException("Child not found: " + id));
    }

    public Child getByIdUnchecked(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Child not found: " + id));
    }

    public Child create(ChildRequest req, Long ownerId) {
        AppUser owner = userRepo.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Child child = new Child();
        child.setOwner(owner);
        child.setName(req.getName());
        child.setBirthYear(req.getBirthYear());
        child.setAvatarEmoji(req.getAvatarEmoji());
        child.setGender(req.getGender());
        child.setTheme(req.getTheme() != null ? req.getTheme() : "coral");
        child.setEnabledFeatures(req.getEnabledFeatures() != null
                ? req.getEnabledFeatures()
                : defaultFeatures(req.getBirthYear()));
        return repo.save(child);
    }

    public Child update(Long id, ChildRequest req, Long ownerId) {
        Child child = getById(id, ownerId);
        child.setName(req.getName());
        child.setBirthYear(req.getBirthYear());
        child.setAvatarEmoji(req.getAvatarEmoji());
        child.setGender(req.getGender());
        child.setTheme(req.getTheme() != null ? req.getTheme() : "coral");
        if (req.getEnabledFeatures() != null) {
            child.setEnabledFeatures(req.getEnabledFeatures());
        }
        return repo.save(child);
    }

    public static int ageFromBirthYear(Integer birthYear) {
        if (birthYear == null) return 6;
        return LocalDate.now().getYear() - birthYear;
    }

    private String defaultFeatures(Integer birthYear) {
        int age = ageFromBirthYear(birthYear);
        if (age >= 7) {
            return "[\"stories\",\"activities\",\"curiosity\",\"draw\",\"journal\",\"memory\",\"timeline\",\"readquiz\",\"mywriting\"]";
        }
        return "[\"stories\",\"activities\",\"curiosity\",\"draw\",\"journal\",\"memory\",\"timeline\"]";
    }

    public Child checkin(Long id, Long ownerId) {
        Child child = getById(id, ownerId);
        LocalDate today = LocalDate.now();
        LocalDate last = child.getLastStreakDate();
        if (last == null || last.isBefore(today.minusDays(1))) {
            child.setStreakCount(1);
        } else if (last.isBefore(today)) {
            child.setStreakCount(child.getStreakCount() + 1);
        }
        // same day → no-op on count
        child.setLastStreakDate(today);
        return repo.save(child);
    }

    @Transactional
    public void delete(Long id, Long ownerId) {
        Child child = getById(id, ownerId);
        Long childId = child.getId();

        // Delete R2 audio files stored on stories for this child
        storyRepository.findByChildIdOrderByCreatedAtDesc(childId).forEach(story -> {
            if (story.getAudioUrls() == null) return;
            try {
                Map<String, String> urls = objectMapper.readValue(story.getAudioUrls(), new TypeReference<>() {});
                urls.keySet().forEach(key -> {
                    try { r2Service.delete(key); } catch (Exception ignored) {}
                });
            } catch (Exception ignored) {}
        });

        storyRepository.deleteByChildId(childId);
        activityRepository.deleteByChildId(childId);
        journalRepository.deleteByChildId(childId);
        curiosityRepository.deleteByChildId(childId);
        readQuizRepository.deleteByChildId(childId);
        writingRepository.deleteByChildId(childId);
        flashcardSetRepository.deleteByChildId(childId);
        memoryMatchRepository.deleteByChildId(childId);
        wordOfDayRepository.deleteByChildId(childId);
        notificationRepository.deleteByChildId(childId);
        aiUsageLogRepository.deleteByChildId(childId);

        repo.delete(child);
    }
}
