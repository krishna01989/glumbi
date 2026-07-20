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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

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
        Object result;
        try {
            result = service.explain(req);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not answer question"));
        }
        if (!quotaService.tryConsume(user.id(), "curiosity", req.getChildId())) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/similar")
    public List<CuriosityEntry> getSimilar(@PathVariable Long id) {
        return service.findSimilar(id);
    }

    @GetMapping("/child/{childId}")
    public List<CuriosityEntry> getByChild(@PathVariable Long childId,
                                            @RequestParam(required = false) LocalDateTime from,
                                            @RequestParam(required = false) LocalDateTime to) {
        return service.getByChild(childId, from, to);
    }

    @GetMapping("/child/{childId}/paged")
    public Page<CuriosityEntry> getByChildPaged(@PathVariable Long childId,
                                                 @RequestParam(defaultValue = "0") int page) {
        return service.getByChildPaged(childId, PageRequest.of(page, 20));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
