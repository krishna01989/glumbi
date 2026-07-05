package com.glumbi.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.agent.TranslationAgent;
import com.glumbi.dto.StoryRequest;
import com.glumbi.entity.FamilyVoice;
import com.glumbi.entity.Story;
import com.glumbi.repository.FamilyVoiceRepository;
import com.glumbi.repository.StoryRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.ElevenLabsService;
import com.glumbi.service.R2Service;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import com.glumbi.service.StoryService;
import com.glumbi.service.TextToSpeechService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {

    private final StoryService service;
    private final TranslationAgent translationAgent;
    private final TextToSpeechService ttsService;
    private final ElevenLabsService elevenLabsService;
    private final FamilyVoiceRepository familyVoiceRepository;
    private final StoryRepository storyRepository;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;
    private final R2Service r2Service;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Hot in-memory cache — avoids even a redirect for repeated listens in same server lifecycle
    private final ConcurrentHashMap<String, byte[]> audioCache = new ConcurrentHashMap<>();

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@Valid @RequestBody StoryRequest req,
                                      @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "story")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Stories are currently unavailable."));
        }
        if (!rateLimiter.tryConsume(user.id(), Endpoint.STORY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've generated too many stories this hour. Please try again later!"));
        }
        if (!quotaService.tryConsume(user.id(), "story", req.getChildId())) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly story limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(service.generate(req));
    }

    @GetMapping("/child/{childId}")
    public List<Story> getByChild(@PathVariable Long childId,
                                  @RequestParam(required = false) LocalDateTime from,
                                  @RequestParam(required = false) LocalDateTime to) {
        return service.getByChild(childId, from, to);
    }

    @GetMapping("/child/{childId}/favorites")
    public List<Story> getFavorites(@PathVariable Long childId) {
        return service.getFavorites(childId);
    }

    @PatchMapping("/{id}/favorite")
    public Story toggleFavorite(@PathVariable Long id) {
        return service.toggleFavorite(id);
    }

    @GetMapping("/{id}/translate")
    public TranslationAgent.TranslationResult translate(
            @PathVariable Long id,
            @RequestParam String language) {
        Story story = service.getById(id);
        return translationAgent.translate(story.getTitle(), story.getContent(), language);
    }

    @GetMapping(value = "/{id}/listen", produces = "audio/mpeg")
    public ResponseEntity<byte[]> listen(
            @PathVariable Long id,
            @RequestParam(defaultValue = "english") String language,
            @RequestParam(required = false) String voice,
            @RequestParam(required = false) Long familyVoiceId,
            @RequestParam(required = false) String token,
            @AuthenticationPrincipal AuthUser authUser,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {
        try {
            // Resolve ElevenLabs voice ID from familyVoiceId param
            String elVoiceId = null;
            if (familyVoiceId != null && authUser != null) {
                FamilyVoice fv = familyVoiceRepository.findById(familyVoiceId).orElse(null);
                if (fv != null && fv.getUser().getId().equals(authUser.id())) {
                    elVoiceId = fv.getElevenLabsVoiceId();
                }
            }
            String cacheKey = id + ":" + language.toLowerCase()
                    + (elVoiceId != null ? ":el:" + elVoiceId : (voice != null ? ":" + voice : ""));

            // 1. Hot in-memory cache hit — serve bytes directly (Range-request friendly)
            byte[] audio = audioCache.get(cacheKey);

            // 2. R2 persistent cache hit — redirect to CDN URL, Cloudflare handles Range requests natively
            if (audio == null && r2Service.isConfigured()) {
                String r2Url = getStoredAudioUrl(service.getById(id), cacheKey);
                if (r2Url != null) {
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .location(URI.create(r2Url))
                            .build();
                }
            }

            if (audio == null) {
                if (authUser != null && !quotaService.isFeatureEnabled(authUser.id(), "story-listen")) {
                    return ResponseEntity.status(403).body(null);
                }
                Story story = service.getById(id);
                // Charge 1 credit for first-time TTS synthesis (cache miss only)
                if (authUser != null && !quotaService.tryConsume(authUser.id(), "story-listen",
                        story.getChild() != null ? story.getChild().getId() : null)) {
                    return ResponseEntity.status(429).body(null);
                }
                String title, content;
                if ("english".equalsIgnoreCase(language)) {
                    title   = story.getTitle();
                    content = story.getContent();
                } else {
                    TranslationAgent.TranslationResult translated =
                            translationAgent.translate(story.getTitle(), story.getContent(), language);
                    title   = translated.title();
                    content = translated.content();
                }

                // Use ElevenLabs custom voice if requested, otherwise Google TTS
                if (elVoiceId != null && elevenLabsService.isConfigured()) {
                    try {
                        audio = elevenLabsService.synthesize(title + ". " + content, elVoiceId);
                    } catch (Exception e) {
                        System.err.println("[listen] ElevenLabs TTS failed, falling back to Google TTS: " + e.getMessage());
                        audio = ttsService.synthesize(title + ". " + content, language, voice);
                    }
                } else {
                    audio = ttsService.synthesize(title + ". " + content, language, voice);
                }

                // Upload to R2 — if successful, evict from memory and redirect going forward
                if (r2Service.isConfigured()) {
                    try {
                        String r2Url = r2Service.upload(cacheKey, audio);
                        storeAudioUrl(story, cacheKey, r2Url);
                        // don't cache in memory — future requests will redirect to R2
                    } catch (Exception e) {
                        System.err.println("[listen] R2 upload failed (non-fatal): " + e.getMessage());
                        audioCache.put(cacheKey, audio); // fallback: keep in memory if R2 failed
                    }
                } else {
                    audioCache.put(cacheKey, audio);
                }
            }

            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                String[] parts = rangeHeader.substring(6).split("-");
                long start = Long.parseLong(parts[0]);
                long end   = (parts.length > 1 && !parts[1].isEmpty())
                        ? Long.parseLong(parts[1])
                        : audio.length - 1;
                end = Math.min(end, audio.length - 1);
                int length = (int)(end - start + 1);
                byte[] chunk = Arrays.copyOfRange(audio, (int) start, (int) end + 1);
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + audio.length)
                        .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(length))
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .contentType(MediaType.parseMediaType("audio/mpeg"))
                        .body(chunk);
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"story.mp3\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(audio.length))
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .body(audio);
        } catch (Exception e) {
            System.err.println("[listen] ERROR: " + e.getClass().getName() + ": " + e.getMessage());
            if (e.getCause() != null) System.err.println("[listen] CAUSE: " + e.getCause().getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getStoredAudioUrl(Story story, String cacheKey) {
        if (story.getAudioUrls() == null) return null;
        try {
            Map<String, String> map = objectMapper.readValue(story.getAudioUrls(), new TypeReference<>() {});
            return map.get(cacheKey);
        } catch (Exception e) {
            return null;
        }
    }

    private void storeAudioUrl(Story story, String cacheKey, String url) {
        try {
            Map<String, String> map = story.getAudioUrls() != null
                    ? objectMapper.readValue(story.getAudioUrls(), new TypeReference<>() {})
                    : new HashMap<>();
            map.put(cacheKey, url);
            story.setAudioUrls(objectMapper.writeValueAsString(map));
            storyRepository.save(story);
        } catch (Exception e) {
            System.err.println("[listen] Failed to persist R2 URL: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (r2Service.isConfigured()) {
            try {
                Story story = service.getById(id);
                if (story.getAudioUrls() != null) {
                    Map<String, String> urlMap = objectMapper.readValue(story.getAudioUrls(), new com.fasterxml.jackson.core.type.TypeReference<>() {});
                    urlMap.keySet().forEach(r2Service::delete);
                }
            } catch (Exception e) {
                System.err.println("[delete] R2 cleanup failed (non-fatal): " + e.getMessage());
            }
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
