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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

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

    @GetMapping("/child/{childId}/paged")
    public Page<JournalEntry> getByChildPaged(@PathVariable Long childId,
                                               @RequestParam(defaultValue = "0") int page) {
        return service.getByChildPaged(childId, PageRequest.of(page, 20));
    }

    @PostMapping("/ai-entry/child/{childId}")
    public ResponseEntity<?> generateAiEntry(@PathVariable Long childId,
                                             @RequestBody(required = false) Map<String, String> body,
                                             @AuthenticationPrincipal AuthUser user) {
        if (!quotaService.isFeatureEnabled(user.id(), "journal-ai")) {
            return ResponseEntity.status(403).body(Map.of("error", "Journal AI is not enabled"));
        }
        String selectedMood = body != null ? body.get("selectedMood") : null;
        if (!quotaService.tryConsume(user.id(), "journal-ai", childId)) {
            return ResponseEntity.status(429).body(Map.of("error", "You've reached your monthly limit. It resets at the start of next month!"));
        }
        var result = service.generateAiEntry(childId, selectedMood);
        if (result == null) return ResponseEntity.status(500).body(Map.of("error", "Could not generate entry"));
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
