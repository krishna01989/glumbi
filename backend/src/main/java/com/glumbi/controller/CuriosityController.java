package com.glumbi.controller;

import com.glumbi.dto.CuriosityRequest;
import com.glumbi.entity.CuriosityEntry;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.CuriosityService;
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
@RequestMapping("/api/curiosity")
@RequiredArgsConstructor
public class CuriosityController {

    private final CuriosityService service;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@Valid @RequestBody CuriosityRequest req,
                                 @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "curiosity")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Curiosity Corner is currently unavailable."));
        }
        if (!rateLimiter.tryConsume(user.id(), Endpoint.CURIOSITY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many questions this hour. Come back soon!"));
        }
        if (!quotaService.tryConsume(user.id(), "curiosity", req.getChildId())) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(service.explain(req));
    }

    @GetMapping("/child/{childId}")
    public List<CuriosityEntry> getByChild(@PathVariable Long childId,
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
