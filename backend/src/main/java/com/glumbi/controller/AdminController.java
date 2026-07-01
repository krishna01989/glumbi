package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository       userRepo;
    private final ChildRepository      childRepo;
    private final StoryRepository      storyRepo;
    private final ActivityRepository   activityRepo;
    private final JournalRepository    journalRepo;
    private final CuriosityRepository  curiosityRepo;
    private final PasswordEncoder      encoder;

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        return userRepo.findAll().stream().map(u -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id",          u.getId());
            m.put("email",       u.getEmail());
            m.put("role",        u.getRole().name());
            m.put("createdAt",   u.getCreatedAt());
            m.put("childCount",  (long) childRepo.findByOwnerId(u.getId()).size());
            m.put("authMethod",  u.getGoogleSub() != null ? "google" : "password");
            return m;
        }).toList();
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepo.existsById(id)) return ResponseEntity.notFound().build();

        // Delete all child data in order (FK constraints)
        List<Child> children = childRepo.findByOwnerId(id);
        for (Child child : children) {
            storyRepo.deleteByChildId(child.getId());
            activityRepo.deleteByChildId(child.getId());
            journalRepo.deleteByChildId(child.getId());
            curiosityRepo.deleteByChildId(child.getId());
            childRepo.delete(child);
        }
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static final java.util.regex.Pattern STRONG_PASSWORD =
        java.util.regex.Pattern.compile("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?]).{8,}$");

    @PatchMapping("/users/{id}/password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        if (newPassword == null || !STRONG_PASSWORD.matcher(newPassword).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                "Password must be at least 8 characters and include an uppercase letter, a number, and a special character"));
        }
        return userRepo.findById(id).map(u -> {
            u.setPasswordHash(encoder.encode(newPassword));
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "Password updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepo.findById(id).map(u -> {
            u.setRole(AppUser.Role.valueOf(body.get("role").toUpperCase()));
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("email", u.getEmail(), "role", u.getRole().name()));
        }).orElse(ResponseEntity.notFound().build());
    }
}
