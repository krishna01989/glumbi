package com.glumbi.controller;

import com.glumbi.dto.ChildRequest;
import com.glumbi.entity.Child;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ChildService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/children")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService service;

    @GetMapping
    public List<Child> getAll(@AuthenticationPrincipal AuthUser user) {
        return service.getByOwner(user.id());
    }

    @GetMapping("/{id}")
    public Child getById(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        return service.getById(id, user.id());
    }

    @PostMapping
    public Child create(@Valid @RequestBody ChildRequest req, @AuthenticationPrincipal AuthUser user) {
        return service.create(req, user.id());
    }

    @PutMapping("/{id}")
    public Child update(@PathVariable Long id, @Valid @RequestBody ChildRequest req,
                        @AuthenticationPrincipal AuthUser user) {
        return service.update(id, req, user.id());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        service.delete(id, user.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<Map<String, Object>> checkin(@PathVariable Long id,
                                                       @AuthenticationPrincipal AuthUser user) {
        int streak = service.checkin(id, user.id());
        return ResponseEntity.ok(Map.of("streakCount", streak));
    }
}
