package com.glumbi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccountDeletionService {

    private final ChildRepository              childRepository;
    private final StoryRepository              storyRepository;
    private final ActivityRepository           activityRepository;
    private final JournalRepository            journalRepository;
    private final CuriosityRepository          curiosityRepository;
    private final WordOfDayRepository          wordOfDayRepository;
    private final ReadQuizRepository           readQuizRepository;
    private final DrawSaveRepository           drawSaveRepository;
    private final FlipbookSaveRepository       flipbookSaveRepository;
    private final MemoryMatchRepository        memoryMatchRepository;
    private final FlashcardSetRepository       flashcardSetRepository;
    private final WritingRepository            writingRepository;
    private final ChildActivityEventRepository childActivityEventRepository;
    private final NotificationRepository       notificationRepository;
    private final AiUsageLogRepository         aiUsageLogRepository;
    private final UserFeatureOverrideRepository userFeatureOverrideRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final FamilyVoiceRepository        familyVoiceRepository;
    private final UserRepository               userRepository;
    private final ElevenLabsService            elevenLabsService;
    private final R2Service                    r2Service;
    private final ObjectMapper                 objectMapper;

    @Transactional
    public void deleteUser(Long userId) {
        // 1. Clean up ElevenLabs voices and R2 story audio for each voice
        familyVoiceRepository.findByUserIdOrderByCreatedAtAsc(userId).forEach(voice -> {
            String elVoiceId = voice.getElevenLabsVoiceId();
            String voiceKeySuffix = ":el:" + elVoiceId;

            // Delete R2 audio files cached for this voice across all stories
            childRepository.findByOwnerId(userId).forEach(child ->
                storyRepository.findByChildIdOrderByCreatedAtDesc(child.getId()).forEach(story -> {
                    if (story.getAudioUrls() == null) return;
                    try {
                        Map<String, String> urls = objectMapper.readValue(story.getAudioUrls(), new TypeReference<>() {});
                        urls.forEach((key, url) -> {
                            if (key.contains(voiceKeySuffix)) {
                                try { r2Service.delete(key); } catch (Exception ignored) {}
                            }
                        });
                    } catch (Exception ignored) {}
                })
            );

            try { elevenLabsService.deleteVoice(elVoiceId); } catch (Exception ignored) {}
        });
        familyVoiceRepository.deleteByUserId(userId);

        // 2. Delete all child data — clean up all R2 audio (including default TTS) before DB delete
        childRepository.findByOwnerId(userId).forEach(child -> {
            long childId = child.getId();
            storyRepository.findByChildIdOrderByCreatedAtDesc(childId).forEach(story -> {
                if (story.getAudioUrls() == null) return;
                try {
                    Map<String, String> urls = objectMapper.readValue(story.getAudioUrls(), new TypeReference<>() {});
                    urls.forEach((key, url) -> { try { r2Service.delete(key); } catch (Exception ignored) {} });
                } catch (Exception ignored) {}
            });
            storyRepository.deleteByChildId(childId);
            activityRepository.deleteByChildId(childId);
            journalRepository.deleteByChildId(childId);
            curiosityRepository.deleteByChildId(childId);
            wordOfDayRepository.deleteByChildId(childId);
            readQuizRepository.deleteByChildId(childId);
            drawSaveRepository.deleteByChildId(childId);
            flipbookSaveRepository.deleteByChildId(childId);
            memoryMatchRepository.deleteByChildId(childId);
            flashcardSetRepository.deleteByChildId(childId);
            writingRepository.deleteByChildId(childId);
            childActivityEventRepository.anonymiseByChildId(childId);
            aiUsageLogRepository.anonymiseByChildId(childId);
            notificationRepository.deleteByChildId(childId);
            childRepository.delete(child);
        });

        // 3. Anonymise user-level analytics, delete user-level config
        childActivityEventRepository.anonymiseByUserId(userId);
        aiUsageLogRepository.anonymiseByUserId(userId);
        userFeatureOverrideRepository.deleteByIdUserId(userId);
        passwordResetTokenRepository.invalidateAllForUser(userId);

        // 4. Delete the user account
        userRepository.deleteById(userId);
    }
}
