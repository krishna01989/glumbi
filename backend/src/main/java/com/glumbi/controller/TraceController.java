package com.glumbi.controller;

import com.glumbi.agent.TraceAgent;
import com.glumbi.repository.ChildActivityEventRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.RateLimitService.Endpoint;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;

@RestController
@RequestMapping("/api/trace")
@RequiredArgsConstructor
public class TraceController {

    private final TraceAgent agent;
    private final RateLimitService rateLimiter;
    private final ApiQuotaService quotaService;
    private final ChildActivityEventRepository eventRepo;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "maze")) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Maze game is currently unavailable."));
        }
        if (!rateLimiter.tryConsume(user.id(), Endpoint.CURIOSITY)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many requests this hour. Come back soon!"));
        }
        Long childId     = Long.parseLong(body.get("childId"));
        String childName = body.get("childName");
        int childAge     = Integer.parseInt(body.get("childAge"));
        String difficulty = body.getOrDefault("difficulty", "easy");

        // Fetch recent avg wall hits (last 30 days) for adaptive sizing
        LocalDateTime thirtyDaysAgo = LocalDateTime.now(ZoneOffset.UTC).minusDays(30);
        Double recentAvgWalls = eventRepo.avgMazeWallHitsForChild(childId, thirtyDaysAgo);
        String perfContext = recentAvgWalls != null
                ? String.format("recent average wall hits: %.1f", recentAvgWalls)
                : "no recent maze data";

        int[] range = mazeRange(childAge);

        Object result;
        try {
            result = agent.generate(childName, childAge, difficulty, perfContext,
                    range[0], range[1], range[2], range[3]);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate maze"));
        }
        if (!quotaService.tryConsume(user.id(), "maze", childId)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        return ResponseEntity.ok(result);
    }

    /** Age-based [minCols, maxCols, minRows, maxRows] for adaptive sizing. */
    private int[] mazeRange(int age) {
        if (age <= 4)  return new int[]{3, 5,  3, 4};
        if (age <= 6)  return new int[]{4, 7,  3, 5};
        if (age <= 8)  return new int[]{6, 9,  4, 6};
        if (age <= 10) return new int[]{8, 11, 5, 7};
        return new int[]{10, 13, 6, 8};
    }
}
