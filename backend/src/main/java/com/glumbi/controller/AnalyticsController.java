package com.glumbi.controller;

import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ChildActivityEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ChildActivityEventService service;

    // ── Parent analytics — ownership is verified in service ──────────────────
    // Note: batch event ingest is handled by gRPC (GrpcActivityEventService)

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
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @AuthenticationPrincipal AuthUser caller) {

        if (!"ADMIN".equals(caller.role()) && !"SUPER_ADMIN".equals(caller.role())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
        }
        LocalDate fromDate = from != null ? LocalDate.parse(from) : null;
        LocalDate toDate   = to   != null ? LocalDate.parse(to)   : null;
        return ResponseEntity.ok(service.getAdminAnalytics(fromDate, toDate));
    }
}
