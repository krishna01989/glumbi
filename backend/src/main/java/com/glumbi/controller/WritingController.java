package com.glumbi.controller;

import com.glumbi.agent.SafetyGuard;
import com.glumbi.dto.WritingRequest;
import com.glumbi.entity.WritingEntry;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import com.glumbi.service.WritingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/writing")
@RequiredArgsConstructor
public class WritingController {

    private final WritingService service;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    @PostMapping
    public ResponseEntity<?> save(@Valid @RequestBody WritingRequest req) {
        try {
            return ResponseEntity.ok(service.save(req));
        } catch (SafetyGuard.SafetyException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @Valid @RequestBody WritingRequest req) {
        try {
            return ResponseEntity.ok(service.update(id, req));
        } catch (SafetyGuard.SafetyException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> feedback(@PathVariable Long id,
                                      @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "writing-coach"))
            return ResponseEntity.status(403).body(Map.of("error", "Writing Coach is currently unavailable."));
        if (!rateLimiter.tryConsume(user.id(), Endpoint.WRITING))
            return ResponseEntity.status(429).body(Map.of("error", "Too many feedback requests this hour. Try again later!"));
        if (!quotaService.tryConsume(user.id(), "writing-coach"))
            return ResponseEntity.status(429).body(Map.of("error", "You've reached your monthly limit. Resets on the 1st!"));
        try {
            return ResponseEntity.ok(service.getFeedback(id));
        } catch (SafetyGuard.SafetyException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/child/{childId}")
    public List<WritingEntry> getByChild(@PathVariable Long childId,
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
