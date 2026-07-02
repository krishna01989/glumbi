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
        if (!quotaService.tryConsume(user.id(), "read-quiz"))
            return ResponseEntity.status(429).body(Map.of("error", "You've reached your monthly limit. Resets on the 1st!"));
        try {
            return ResponseEntity.ok(service.generate(req));
        } catch (SafetyGuard.SafetyException | RelevanceGuard.RelevanceException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
