package com.glumbi.controller;

import com.glumbi.dto.JournalRequest;
import com.glumbi.entity.JournalEntry;
import com.glumbi.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService service;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
