package com.glumbi.controller;

import com.glumbi.entity.FlashcardSet;
import com.glumbi.entity.MemoryMatch;
import com.glumbi.entity.WordOfDay;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.MemoryPlayService;
import com.glumbi.service.MemoryPlayService.WordOfDayResult;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/memory")
@RequiredArgsConstructor
public class MemoryPlayController {

    private final MemoryPlayService service;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    // ── Flashcards ────────────────────────────────────────────────────────────

    @PostMapping("/flashcards")
    public ResponseEntity<?> generateFlashcards(@RequestBody Map<String, Object> body,
                                                 @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "memory")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Memory Play is currently unavailable."));
        }
        if (!quotaService.isFeatureEnabled(user.id(), "memory-flashcards")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Memory Flashcards is currently unavailable."));
        }
        if (!rateLimiter.tryConsume(user.id(), Endpoint.MEMORY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many Memory Play requests this hour. Come back soon!"));
        }
        Long childId = Long.valueOf(body.get("childId").toString());
        String topic = body.get("topic").toString();
        Object result;
        try {
            result = service.generateFlashcards(childId, topic);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate flashcards"));
        }
        if (!quotaService.tryConsume(user.id(), "memory-flashcards", childId)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/flashcards/child/{childId}")
    public List<FlashcardSet> getFlashcards(@PathVariable Long childId) {
        return service.getFlashcardSets(childId);
    }

    @DeleteMapping("/flashcards/{id}")
    public ResponseEntity<Void> deleteFlashcards(@PathVariable Long id) {
        service.deleteFlashcardSet(id);
        return ResponseEntity.noContent().build();
    }

    // ── Word of Day ───────────────────────────────────────────────────────────

    @GetMapping("/word-of-day/child/{childId}")
    public ResponseEntity<?> getWordOfDay(@PathVariable Long childId,
                                           @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "memory")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Memory Play is currently unavailable."));
        }

        WordOfDayResult result = service.getOrGenerateWordOfDay(childId);
        if (result == null) {
            return ResponseEntity.status(503).body(Map.of("error", "Could not generate a word today. Please try again later."));
        }

        // Only consume quota on fresh generation
        if (result.fresh()) {
            if (!quotaService.isFeatureEnabled(user.id(), "word-of-day")) {
                // Feature disabled but we already generated — just return it without consuming
                return ResponseEntity.ok(result.word());
            }
            quotaService.tryConsume(user.id(), "word-of-day", childId);
        }

        return ResponseEntity.ok(result.word());
    }

    // ── Memory Match ──────────────────────────────────────────────────────────

    @PostMapping("/match")
    public ResponseEntity<?> generateMatch(@RequestBody Map<String, Object> body,
                                            @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "memory")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Memory Play is currently unavailable."));
        }
        if (!quotaService.isFeatureEnabled(user.id(), "memory-match")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Memory Match is currently unavailable."));
        }
        if (!rateLimiter.tryConsume(user.id(), Endpoint.MEMORY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many Memory Play requests this hour. Come back soon!"));
        }
        Long childId = Long.valueOf(body.get("childId").toString());
        String theme = body.get("theme").toString();
        Object result;
        try {
            result = service.generateMemoryMatch(childId, theme);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate memory match"));
        }
        if (!quotaService.tryConsume(user.id(), "memory-match", childId)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/word-of-day/child/{childId}/history")
    public List<WordOfDay> getWordOfDayHistory(@PathVariable Long childId) {
        return service.getWordOfDayHistory(childId);
    }

    @GetMapping("/match/child/{childId}")
    public List<MemoryMatch> getMatches(@PathVariable Long childId) {
        return service.getMemoryMatches(childId);
    }

    @DeleteMapping("/match/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long id) {
        service.deleteMemoryMatch(id);
        return ResponseEntity.noContent().build();
    }
}
