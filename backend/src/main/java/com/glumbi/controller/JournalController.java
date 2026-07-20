package com.glumbi.controller;

import com.glumbi.dto.JournalRequest;
import com.glumbi.entity.JournalEntry;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService service;
    private final ApiQuotaService quotaService;

    @PostMapping
    public JournalEntry create(@Valid @RequestBody JournalRequest req) {
        return service.create(req);
    }

    @GetMapping("/child/{childId}")
    public List<JournalEntry> getByChild(@PathVariable Long childId,
                                          @RequestParam(required = false) LocalDateTime from,
                                          @RequestParam(required = false) LocalDateTime to) {
        return service.getByChild(childId, from, to);
    }

    @PostMapping("/ai-entry/child/{childId}")
    public ResponseEntity<?> generateAiEntry(@PathVariable Long childId,
                                             @RequestBody(required = false) Map<String, String> body,
                                             @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "journal-ai")) {
            return ResponseEntity.status(403).body(Map.of("error", "Journal AI is not enabled"));
        }
        String selectedMood = body != null ? body.get("selectedMood") : null;
        var result = service.generateAiEntry(childId, selectedMood);
        if (result == null) return ResponseEntity.status(500).body(Map.of("error", "Could not generate entry"));
        if (!quotaService.tryConsume(user.id(), "journal-ai", childId)) {
            return ResponseEntity.status(429).body(Map.of("error", "Monthly quota reached"));
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
