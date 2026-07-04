package com.glumbi.controller;

import com.glumbi.agent.SafetyGuard;
import com.glumbi.agent.StoryAgent;
import com.glumbi.dto.WritingRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.WritingEntry;
import com.glumbi.repository.WritingRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.ChildService;
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
    private final WritingRepository writingRepository;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;
    private final StoryAgent storyAgent;
    private final ChildService childService;

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
        Long writingChildId = writingRepository.findById(id)
            .map(e -> e.getChild() != null ? e.getChild().getId() : null).orElse(null);
        if (!quotaService.tryConsume(user.id(), "writing-coach", writingChildId))
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

    @PostMapping("/{id}/continue")
    public ResponseEntity<?> continueStory(@PathVariable Long id,
                                           @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "story"))
            return ResponseEntity.status(403).body(Map.of("error", "Story feature is currently unavailable."));
        if (!rateLimiter.tryConsume(user.id(), Endpoint.STORY))
            return ResponseEntity.status(429).body(Map.of("error", "Too many requests this hour. Try again later!"));
        WritingEntry entry = writingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Writing entry not found"));
        Child child = entry.getChild();
        Long childId = child != null ? child.getId() : null;
        if (!quotaService.tryConsume(user.id(), "story", childId))
            return ResponseEntity.status(429).body(Map.of("error", "You've reached your monthly limit. Resets on the 1st!"));
        int age = ChildService.ageFromBirthYear(child != null ? child.getBirthYear() : null);
        String gender = child != null ? child.getGender() : null;
        String name = child != null ? child.getName() : "you";
        StoryAgent.StoryResult result = storyAgent.continueStory(name, age, gender, entry.getTitle(), entry.getContent());
        return ResponseEntity.ok(Map.of("title", result.title(), "content", result.content()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
