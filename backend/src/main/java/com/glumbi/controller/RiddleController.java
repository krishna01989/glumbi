package com.glumbi.controller;

import com.glumbi.agent.RiddleAgent;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/riddle")
@RequiredArgsConstructor
public class RiddleController {

    private final RiddleAgent agent;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "riddle")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Riddles are currently unavailable."));
        }
        if (!rateLimiter.tryConsume(user.id(), Endpoint.CURIOSITY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many requests this hour. Come back soon!"));
        }
        Long childId   = Long.parseLong(body.get("childId"));
        String childName = body.get("childName");
        int childAge     = Integer.parseInt(body.get("childAge"));

        if (!quotaService.tryConsume(user.id(), "riddle", childId)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(agent.generate(childName, childAge));
    }
}
