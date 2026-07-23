package com.glumbi.controller;

import com.glumbi.agent.RelevanceGuard;
import com.glumbi.agent.SafetyGuard;
import com.glumbi.dto.ReadQuizRequest;
import com.glumbi.entity.ReadQuizEntry;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import com.glumbi.service.ReadQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/readquiz")
@RequiredArgsConstructor
public class ReadQuizController {

    private final ReadQuizService service;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@Valid @RequestBody ReadQuizRequest req,
                                      @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "read-quiz"))
            return ResponseEntity.status(403).body(Map.of("error", "Read & Quiz is currently unavailable."));
        if (!rateLimiter.tryConsume(user.id(), Endpoint.READ_QUIZ))
            return ResponseEntity.status(429).body(Map.of("error", "Too many requests this hour. Try again later!"));
        Object result;
        try {
            result = service.generate(req);
        } catch (SafetyGuard.SafetyException | RelevanceGuard.RelevanceException e) {
            // AI ran and blocked the content — still consume credit
            quotaService.tryConsume(user.id(), "read-quiz", req.getChildId());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate quiz"));
        }
        if (!quotaService.tryConsume(user.id(), "read-quiz", req.getChildId()))
            return ResponseEntity.status(429).body(Map.of("error", "You've reached your monthly limit. Resets on the 1st!"));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/from-story")
    public ResponseEntity<?> generateFromStory(@RequestBody Map<String, Long> body,
                                               @AuthenticationPrincipal AuthUser user) {
        Long childId = body.get("childId");
        Long storyId = body.get("storyId");
        if (childId == null || storyId == null)
            return ResponseEntity.badRequest().body(Map.of("error", "childId and storyId are required"));
        // Return existing quiz without touching quota or rate limit
        ReadQuizEntry existing = service.findByStory(childId, storyId);
        if (existing != null) return ResponseEntity.ok(existing);

        if (!quotaService.isFeatureEnabled(user.id(), "read-quiz"))
            return ResponseEntity.status(403).body(Map.of("error", "Read & Quiz is currently unavailable."));
        if (!rateLimiter.tryConsume(user.id(), Endpoint.READ_QUIZ))
            return ResponseEntity.status(429).body(Map.of("error", "Too many requests this hour. Try again later!"));
        Object result;
        try {
            result = service.generateFromStory(childId, storyId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate quiz"));
        }
        if (!quotaService.tryConsume(user.id(), "read-quiz", childId))
            return ResponseEntity.status(429).body(Map.of("error", "You've reached your monthly limit. Resets on the 1st!"));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable Long id,
                                    @RequestBody Map<String, int[]> body) {
        int[] answers = body.getOrDefault("answers", new int[0]);
        return ResponseEntity.ok(service.submit(id, answers));
    }

    @GetMapping("/child/{childId}")
    public List<ReadQuizEntry> getByChild(@PathVariable Long childId,
                                           @RequestParam(required = false) LocalDateTime from,
                                           @RequestParam(required = false) LocalDateTime to) {
        return service.getByChild(childId, from, to);
    }

    @GetMapping("/child/{childId}/paged")
    public Page<ReadQuizEntry> getByChildPaged(@PathVariable Long childId,
                                                @RequestParam(defaultValue = "0") int page) {
        return service.getByChildPaged(childId, PageRequest.of(page, 20));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
