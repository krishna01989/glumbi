package com.glumbi.controller;

import com.glumbi.agent.TranslationAgent;
import com.glumbi.dto.StoryRequest;
import com.glumbi.entity.Story;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
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

import java.time.LocalDateTime;
import java.util.Arrays;
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
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    // Cache audio bytes so Range requests don't re-invoke TTS/translation
    private final ConcurrentHashMap<String, byte[]> audioCache = new ConcurrentHashMap<>();

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@Valid @RequestBody StoryRequest req,
                                      @AuthenticationPrincipal AuthUser user) {
        if (!rateLimiter.tryConsume(user.id(), Endpoint.STORY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've generated too many stories this hour. Please try again later!"));
        }
        if (!quotaService.tryConsume(user.id())) {
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
            @RequestParam(required = false) String token,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {
        try {
            String cacheKey = id + ":" + language.toLowerCase();
            byte[] audio = audioCache.get(cacheKey);
            if (audio == null) {
                Story story = service.getById(id);
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
                audio = ttsService.synthesize(title + ". " + content, language);
                audioCache.put(cacheKey, audio);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
