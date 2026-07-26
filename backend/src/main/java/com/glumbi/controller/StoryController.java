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
import com.glumbi.service.AudioTokenService;
import com.glumbi.service.ElevenLabsService;
import com.glumbi.service.R2Service;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import com.glumbi.service.StoryService;
import com.glumbi.service.TextToSpeechService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.annotation.PostConstruct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
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
    private final AudioTokenService audioTokenService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.cache.tts-max-size:200}") private int ttsCacheMaxSize;
    @Value("${app.cache.tts-ttl-hours:6}")  private int ttsCacheTtlHours;

    // Hot in-memory cache — bounded by size and TTL to prevent unbounded growth
    private Cache<String, byte[]> audioCache;

    @PostConstruct
    void initCache() {
        audioCache = Caffeine.newBuilder()
                .maximumSize(ttsCacheMaxSize)
                .expireAfterAccess(ttsCacheTtlHours, TimeUnit.HOURS)
                .build();
    }

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
        StoryService.StoryGenerateResult result;
        try {
            result = service.generate(req);
        } catch (com.glumbi.agent.RelevanceGuard.RelevanceException | com.glumbi.agent.SafetyGuard.SafetyException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate story"));
        }
        if (!quotaService.tryConsume(user.id(), "story", req.getChildId())) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly story limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/child/{childId}")
    public List<Story> getByChild(@PathVariable Long childId,
                                  @RequestParam(required = false) LocalDateTime from,
                                  @RequestParam(required = false) LocalDateTime to) {
        return service.getByChild(childId, from, to);
    }

    @GetMapping("/child/{childId}/paged")
    public Page<Map<String, Object>> getByChildPaged(@PathVariable Long childId,
                                                      @RequestParam(defaultValue = "0") int page) {
        return service.getByChildPaged(childId, PageRequest.of(page, 20));
    }

    @GetMapping("/child/{childId}/favorites")
    public List<Story> getFavorites(@PathVariable Long childId) {
        return service.getFavorites(childId);
    }

    @PatchMapping("/{id}/favorite")
    public Story toggleFavorite(@PathVariable Long id) {
        return service.toggleFavorite(id);
    }

    @GetMapping("/{id}/similar")
    public List<Story> getSimilar(@PathVariable Long id) {
        return service.findSimilar(id);
    }

    @GetMapping("/{id}/translate")
    public TranslationAgent.TranslationResult translate(
            @PathVariable Long id,
            @RequestParam String language,
            @AuthenticationPrincipal AuthUser user) {
        Story story = service.getById(id);
        String translationKey = language.toLowerCase();
        TranslationAgent.TranslationResult translated = getStoredTranslation(story, translationKey);
        if (translated == null) {
            int childAge = story.getChild() != null && story.getChild().getBirthYear() != null
                    ? java.time.LocalDate.now().getYear() - story.getChild().getBirthYear() : 6;
            String childName = story.getChild() != null ? story.getChild().getName() : null;
            translated = translationAgent.translate(story.getTitle(), story.getContent(), language, childAge, childName);
            storeTranslation(story, translationKey, translated);
            if (user != null) {
                quotaService.tryConsume(user.id(), "translation", story.getChild().getId());
            }
        }
        return translated;
    }

    @GetMapping(value = "/{id}/listen", produces = "audio/mpeg")
    public ResponseEntity<byte[]> listen(
            @PathVariable Long id,
            @RequestParam(defaultValue = "english") String language,
            @RequestParam(required = false) String voice,
            @RequestParam(required = false) Long familyVoiceId,
            @RequestParam(required = false) String stoken,
            @RequestParam(required = false) Integer part,
            @RequestParam(required = false) String branch,
            @AuthenticationPrincipal AuthUser authUser,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {
        if (!audioTokenService.validate(stoken, "story:" + id)) {
            return ResponseEntity.status(401).body(null);
        }
        try {
            // Resolve ElevenLabs voice ID from familyVoiceId param
            String elVoiceId = null;
            if (familyVoiceId != null && authUser != null) {
                FamilyVoice fv = familyVoiceRepository.findById(familyVoiceId).orElse(null);
                if (fv != null && fv.getUser().getId().equals(authUser.id())) {
                    elVoiceId = fv.getElevenLabsVoiceId();
                }
            }
            // part=1 or part=2 scopes audio to a Glumbi half; branch=a|b selects the chosen story branch for part2
            String partSuffix = "";
            if (part != null && part == 1) partSuffix = ":p1";
            else if (part != null && part == 2) partSuffix = "b".equalsIgnoreCase(branch) ? ":p2b" : ":p2a";
            String cacheKey = id + ":" + language.toLowerCase()
                    + (elVoiceId != null ? ":el:" + elVoiceId : (voice != null ? ":" + voice : ""))
                    + partSuffix;

            // 1. Hot in-memory cache hit — serve bytes directly (Range-request friendly)
            byte[] audio = audioCache.getIfPresent(cacheKey);

            // 2. R2 persistent cache hit — redirect to CDN URL, Cloudflare handles Range requests natively
            if (audio == null && r2Service.isAvailable()) {
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
                Long listenChildId = story.getChild() != null ? story.getChild().getId() : null;
                // Select the right content slice for Glumbi parts
                String rawContent = story.getContent();
                if (part != null && part == 1 && story.getStoryPart1() != null && !story.getStoryPart1().isBlank()) {
                    rawContent = story.getStoryPart1();
                } else if (part != null && part == 2) {
                    // Prefer the chosen branch; fall back to the other branch, then legacy storyPart2
                    String branchA = story.getStoryPart2A();
                    String branchB = story.getStoryPart2B();
                    String legacy  = story.getStoryPart2();
                    if ("b".equalsIgnoreCase(branch) && branchB != null && !branchB.isBlank()) {
                        rawContent = branchB;
                    } else if (!"b".equalsIgnoreCase(branch) && branchA != null && !branchA.isBlank()) {
                        rawContent = branchA;
                    } else if (legacy != null && !legacy.isBlank()) {
                        rawContent = legacy; // old stories without branching
                    }
                }
                String title, content;
                if ("english".equalsIgnoreCase(language)) {
                    title   = story.getTitle();
                    content = rawContent;
                } else {
                    // Translation key scopes to language + part so each Glumbi slice is stored separately
                    String translationKey = language.toLowerCase() + partSuffix;
                    TranslationAgent.TranslationResult translated = getStoredTranslation(story, translationKey);
                    if (translated == null) {
                        // Cache miss — call Claude, then persist so future misses skip the API call
                        int childAge = story.getChild() != null && story.getChild().getBirthYear() != null
                                ? java.time.LocalDate.now().getYear() - story.getChild().getBirthYear() : 6;
                        String childName = story.getChild() != null ? story.getChild().getName() : null;
                        translated = translationAgent.translate(story.getTitle(), rawContent, language, childAge, childName);
                        storeTranslation(story, translationKey, translated);
                        if (authUser != null) {
                            quotaService.tryConsume(authUser.id(), "translation", listenChildId);
                        }
                    }
                    title   = translated.title();
                    content = translated.content();
                }

                // Use ElevenLabs custom voice if requested, otherwise Google TTS
                if (elVoiceId != null && elevenLabsService.isConfigured()) {
                    try {
                        audio = elevenLabsService.synthesize(title + ". " + content, elVoiceId);
                    } catch (Exception e) {
                        log.warn("ElevenLabs TTS failed, falling back to Google TTS: {}", e.getMessage());
                        audio = ttsService.synthesize(title + ". " + content, language, voice);
                    }
                } else {
                    audio = ttsService.synthesize(title + ". " + content, language, voice);
                }

                // Charge story-listen credit only after TTS succeeds (cache miss only)
                if (authUser != null && !quotaService.tryConsume(authUser.id(), "story-listen", listenChildId)) {
                    return ResponseEntity.status(429).body(null);
                }

                // Upload to R2 — if successful, evict from memory and redirect going forward
                if (r2Service.isAvailable()) {
                    try {
                        String r2Url = r2Service.upload(cacheKey, audio);
                        storeAudioUrl(story, cacheKey, r2Url);
                        // don't cache in memory — future requests will redirect to R2
                    } catch (Exception e) {
                        log.warn("R2 upload failed (non-fatal): {}", e.getMessage());
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
            log.error("Story listen failed: {} — {}", e.getClass().getSimpleName(), e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private TranslationAgent.TranslationResult getStoredTranslation(Story story, String key) {
        if (story.getTranslationsJson() == null) return null;
        try {
            Map<String, Map<String, String>> map = objectMapper.readValue(
                    story.getTranslationsJson(), new TypeReference<>() {});
            Map<String, String> entry = map.get(key);
            if (entry == null) return null;
            return new TranslationAgent.TranslationResult(entry.get("title"), entry.get("content"));
        } catch (Exception e) {
            return null;
        }
    }

    private void storeTranslation(Story story, String key, TranslationAgent.TranslationResult result) {
        try {
            Map<String, Map<String, String>> map = story.getTranslationsJson() != null
                    ? objectMapper.readValue(story.getTranslationsJson(), new TypeReference<>() {})
                    : new HashMap<>();
            map.put(key, Map.of("title", result.title(), "content", result.content()));
            story.setTranslationsJson(objectMapper.writeValueAsString(map));
            storyRepository.save(story);
        } catch (Exception e) {
            log.warn("Failed to persist translation: {}", e.getMessage());
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
            log.warn("Failed to persist R2 URL: {}", e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (r2Service.isAvailable()) {
            try {
                // Collect audio URLs from root story and all chapters before any DB delete
                List<Story> toClean = new java.util.ArrayList<>();
                toClean.add(service.getById(id));
                toClean.addAll(storyRepository.findBySeriesId(id));
                for (Story s : toClean) {
                    if (s.getAudioUrls() != null) {
                        Map<String, String> urlMap = objectMapper.readValue(s.getAudioUrls(), new com.fasterxml.jackson.core.type.TypeReference<>() {});
                        urlMap.keySet().forEach(r2Service::delete);
                    }
                }
            } catch (Exception e) {
                log.warn("R2 audio cleanup failed (non-fatal): {}", e.getMessage());
            }
        }
        boolean seriesDeleted = service.delete(id);
        return seriesDeleted
            ? ResponseEntity.ok(Map.of("seriesDeleted", true))
            : ResponseEntity.noContent().build();
    }
}
