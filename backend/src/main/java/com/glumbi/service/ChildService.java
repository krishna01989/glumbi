package com.glumbi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.dto.ChildRequest;
import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final NotificationRepository       notificationRepository;
    private final ChildActivityEventRepository activityEventRepo;
    private final R2Service             r2Service;
    private final ObjectMapper          objectMapper;
    private final PasswordEncoder       passwordEncoder;

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
        long totalCount = repo.findByOwnerId(ownerId).size();
        if (totalCount >= 3)
            throw new IllegalStateException("You can have up to 3 child profiles per account. Graduate an existing profile to add a new one.");
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
        if (req.getPin() != null && req.getPin().matches("\\d{4}"))
            child.setPinHash(passwordEncoder.encode(req.getPin()));
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
        if (req.getPin() != null && req.getPin().matches("\\d{4}"))
            child.setPinHash(passwordEncoder.encode(req.getPin()));
        if (req.getGraduated() != null)
            child.setGraduated(req.getGraduated());
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

    public Child setPin(Long id, Long ownerId, String pin) {
        if (pin == null || !pin.matches("\\d{4}"))
            throw new IllegalArgumentException("PIN must be exactly 4 digits");
        Child child = getById(id, ownerId);
        child.setPinHash(passwordEncoder.encode(pin));
        return repo.save(child);
    }

    public Child clearPin(Long id, Long ownerId) {
        Child child = getById(id, ownerId);
        child.setPinHash(null);
        return repo.save(child);
    }

    public boolean verifyPin(Long id, Long ownerId, String pin) {
        Child child = getById(id, ownerId);
        if (child.getPinHash() == null) return false;
        return passwordEncoder.matches(pin, child.getPinHash());
    }

    public int checkin(Long id, Long ownerId) {
        getById(id, ownerId); // ownership check
        return computeCurrentStreak(activityEventRepo.getDistinctActiveDates(id));
    }

    private int computeCurrentStreak(List<java.sql.Date> rawDates) {
        if (rawDates.isEmpty()) return 0;
        List<LocalDate> sorted = rawDates.stream()
            .map(java.sql.Date::toLocalDate)
            .distinct()
            .sorted(java.util.Comparator.reverseOrder())
            .toList();
        LocalDate today     = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        if (!sorted.get(0).equals(today) && !sorted.get(0).equals(yesterday)) return 0;
        int streak = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).equals(sorted.get(i - 1).minusDays(1))) streak++;
            else break;
        }
        return streak;
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

        repo.delete(child);
    }
}
