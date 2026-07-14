package com.glumbi.controller;

import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ChildActivityEventService;
import com.glumbi.service.ChildActivityEventService.EventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ChildActivityEventService service;

    // ── Batch event ingest (all authenticated parents) ────────────────────────

    @PostMapping("/events/batch")
    public ResponseEntity<Map<String, Object>> batchEvents(
            @RequestBody Map<String, List<EventDto>> body,
            @AuthenticationPrincipal AuthUser caller) {

        List<EventDto> events = body.get("events");
        if (events == null || events.isEmpty()) {
            return ResponseEntity.ok(Map.of("saved", 0));
        }
        int saved = service.saveBatch(events, caller.id(), caller.email());
        return ResponseEntity.ok(Map.of("saved", saved));
    }

    // ── Parent analytics — ownership is verified in service ──────────────────

    @GetMapping("/child/{childId}")
    public ResponseEntity<?> childAnalytics(
            @PathVariable Long childId,
            @RequestParam(defaultValue = "90") int days,
            @RequestParam(defaultValue = "UTC") String tz,
            @AuthenticationPrincipal AuthUser caller) {

        if (days < 1 || days > 365) days = 90;
        try {
            return ResponseEntity.ok(service.getChildAnalytics(childId, caller.id(), days, tz));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Admin analytics ───────────────────────────────────────────────────────

    @GetMapping("/admin")
    public ResponseEntity<?> adminAnalytics(
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal AuthUser caller) {

        if (!"ADMIN".equals(caller.role()) && !"SUPER_ADMIN".equals(caller.role())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        if (days < 1 || days > 365) days = 30;
        return ResponseEntity.ok(service.getAdminAnalytics(days));
    }
}
