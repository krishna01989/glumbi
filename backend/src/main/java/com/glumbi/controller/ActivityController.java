package com.glumbi.controller;

import com.glumbi.dto.ActivityRequest;
import com.glumbi.dto.RatingRequest;
import com.glumbi.entity.Activity;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ActivityService;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService service;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@Valid @RequestBody ActivityRequest req,
                                      @AuthenticationPrincipal AuthUser user) {
        if (!rateLimiter.tryConsume(user.id(), Endpoint.ACTIVITY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many activity requests this hour. Try again later!"));
        }
        if (!quotaService.tryConsume(user.id())) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(service.generate(req));
    }

    @GetMapping("/child/{childId}")
    public List<Activity> getByChild(@PathVariable Long childId,
                                      @RequestParam(required = false) LocalDateTime from,
                                      @RequestParam(required = false) LocalDateTime to,
                                      @RequestParam(defaultValue = "false") boolean includeLearn) {
        return service.getByChild(childId, from, to, includeLearn);
    }

    @PatchMapping("/{id}/complete")
    public Activity markComplete(@PathVariable Long id, @RequestBody RatingRequest req) {
        return service.markComplete(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/child/{childId}/pending")
    public ResponseEntity<Void> deletePending(@PathVariable Long childId) {
        service.deletePendingByChild(childId);
        return ResponseEntity.noContent().build();
    }
}
