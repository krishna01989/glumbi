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

    private final ChildRepository       childRepository;
    private final StoryRepository       storyRepository;
    private final ActivityRepository    activityRepository;
    private final JournalRepository     journalRepository;
    private final CuriosityRepository   curiosityRepository;
    private final FamilyVoiceRepository familyVoiceRepository;
    private final AiUsageLogRepository  usageLogRepository;
    private final UserRepository        userRepository;
    private final ElevenLabsService     elevenLabsService;
    private final R2Service             r2Service;
    private final ObjectMapper          objectMapper;

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

        // 2. Delete all child data
        childRepository.findByOwnerId(userId).forEach(child -> {
            storyRepository.deleteByChildId(child.getId());
            activityRepository.deleteByChildId(child.getId());
            journalRepository.deleteByChildId(child.getId());
            curiosityRepository.deleteByChildId(child.getId());
            childRepository.delete(child);
        });

        // 3. Delete remaining user records
        userRepository.deleteById(userId);
    }
}
