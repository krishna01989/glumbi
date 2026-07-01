package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Notification;
import com.glumbi.repository.UserRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getAll(@AuthenticationPrincipal AuthUser auth) {
        AppUser user = userRepository.findById(auth.id()).orElseThrow();
        return ResponseEntity.ok(service.getAll(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal AuthUser auth) {
        AppUser user = userRepository.findById(auth.id()).orElseThrow();
        return ResponseEntity.ok(Map.of("count", service.getUnreadCount(user)));
    }

    @PutMapping("/mark-read")
    public ResponseEntity<Void> markRead(@AuthenticationPrincipal AuthUser auth) {
        AppUser user = userRepository.findById(auth.id()).orElseThrow();
        service.markAllRead(user);
        return ResponseEntity.ok().build();
    }
}
