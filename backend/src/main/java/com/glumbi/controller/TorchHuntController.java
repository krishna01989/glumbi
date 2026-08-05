package com.glumbi.controller;

import com.glumbi.entity.Child;
import com.glumbi.entity.TorchHuntPack;
import com.glumbi.repository.ChildRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import com.glumbi.service.TorchHuntService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/torch-hunt")
@RequiredArgsConstructor
public class TorchHuntController {

    private final TorchHuntService torchHuntService;
    private final ChildRepository childRepository;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    /**
     * GET /api/torch-hunt/pack-ready?childId=X&theme=Y
     * Lightweight check — does this parent already have a pack for this theme+ageGroup?
     * No credit check, no generation. Used by frontend to show Ready badge.
     */
    @GetMapping("/pack-ready")
    public ResponseEntity<?> packReady(@RequestParam Long childId,
                                       @RequestParam String theme,
                                       @AuthenticationPrincipal AuthUser user) {
        Optional<Child> childOpt = childRepository.findById(childId);
        if (childOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Child not found"));
        }
        int age = TorchHuntService.childAge(childOpt.get());
        String ageGroup = TorchHuntService.ageGroup(age);
        boolean ready = torchHuntService.packExists(user.id(), theme, ageGroup);
        return ResponseEntity.ok(Map.of("ready", ready));
    }

    /**
     * GET /api/torch-hunt/pack?childId=X&theme=Y
     * Returns existing pack (free) or generates a new one (2 credits).
     * theme = child's Glumbi theme key sent from frontend.
     */
    @GetMapping("/pack")
    public ResponseEntity<?> getPack(@RequestParam Long childId,
                                     @RequestParam String theme,
                                     @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "torch-hunt")) {
            return ResponseEntity.status(403).body(Map.of("error", "Torch Hunt is currently unavailable."));
        }
        if (!rateLimiter.tryConsume(user.id(), Endpoint.CURIOSITY)) {
            return ResponseEntity.status(429).body(Map.of("error", "Too many requests this hour. Come back soon!"));
        }

        Optional<Child> childOpt = childRepository.findById(childId);
        if (childOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Child not found"));
        }
        Child child = childOpt.get();
        int age = TorchHuntService.childAge(child);
        String ageGroup = TorchHuntService.ageGroup(age);

        boolean packExists = torchHuntService.packExists(user.id(), theme, ageGroup);
        if (!packExists) {
            if (!quotaService.tryConsume(user.id(), "torch-hunt", childId)) {
                return ResponseEntity.status(429)
                        .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
            }
        }

        TorchHuntPack pack = torchHuntService.getOrGenerate(user.id(), theme, ageGroup);
        if (pack == null) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate pack"));
        }

        return ResponseEntity.ok(torchHuntService.packToResponse(pack));
    }

    /**
     * POST /api/torch-hunt/pack/refresh
     * Parent forces pack regeneration (always costs 2 credits).
     */
    @PostMapping("/pack/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, Object> body,
                                     @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "torch-hunt")) {
            return ResponseEntity.status(403).body(Map.of("error", "Torch Hunt is currently unavailable."));
        }
        Long childId = Long.parseLong(body.get("childId").toString());
        String theme = body.get("theme").toString();

        Optional<Child> childOpt = childRepository.findById(childId);
        if (childOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Child not found"));
        }
        Child child = childOpt.get();
        int age = TorchHuntService.childAge(child);
        String ageGroup = TorchHuntService.ageGroup(age);

        if (!quotaService.tryConsume(user.id(), "torch-hunt", childId)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }

        TorchHuntPack pack = torchHuntService.refresh(user.id(), theme, ageGroup);
        if (pack == null) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not refresh pack"));
        }

        return ResponseEntity.ok(torchHuntService.packToResponse(pack));
    }
}
