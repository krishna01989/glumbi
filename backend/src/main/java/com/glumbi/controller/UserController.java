package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.*;
import com.glumbi.security.JwtFilter.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final int MONTHLY_LIMIT = 200;
    private static final Pattern STRONG_PASSWORD =
        Pattern.compile("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?]).{8,}$");

    private final UserRepository     userRepository;
    private final ChildRepository    childRepository;
    private final StoryRepository    storyRepository;
    private final ActivityRepository activityRepository;
    private final JournalRepository  journalRepository;
    private final CuriosityRepository curiosityRepository;
    private final PasswordEncoder    encoder;

    @GetMapping("/me/quota")
    public ResponseEntity<?> getQuota(@AuthenticationPrincipal AuthUser authUser) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String thisMonth = YearMonth.now().toString();
        int used = thisMonth.equals(user.getApiCallMonth()) ? user.getMonthlyApiCalls() : 0;

        return ResponseEntity.ok(Map.of(
            "used",  used,
            "limit", MONTHLY_LIMIT,
            "month", thisMonth
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal AuthUser authUser) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(Map.of(
            "email",      user.getEmail(),
            "authMethod", user.getGoogleSub() != null ? "google" : "password",
            "joinedAt",   user.getCreatedAt().toString()
        ));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody Map<String, String> body) {

        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getGoogleSub() != null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Google accounts cannot set a password"));
        }

        String current = body.get("currentPassword");
        String newPass  = body.get("newPassword");

        if (current == null || !encoder.matches(current, user.getPasswordHash())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Current password is incorrect"));
        }
        if (newPass == null || !STRONG_PASSWORD.matcher(newPass).matches()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Password must be at least 8 characters and include an uppercase letter, a number, and a special character"));
        }

        user.setPasswordHash(encoder.encode(newPass));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal AuthUser authUser) {
        List<Child> children = childRepository.findByOwnerId(authUser.id());
        for (Child child : children) {
            storyRepository.deleteByChildId(child.getId());
            activityRepository.deleteByChildId(child.getId());
            journalRepository.deleteByChildId(child.getId());
            curiosityRepository.deleteByChildId(child.getId());
            childRepository.delete(child);
        }
        userRepository.deleteById(authUser.id());
        return ResponseEntity.noContent().build();
    }
}
