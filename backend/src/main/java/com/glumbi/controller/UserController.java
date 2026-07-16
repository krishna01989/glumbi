package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.*;
import com.glumbi.repository.FeatureConfigRepository;
import com.glumbi.repository.UserFeatureOverrideRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Pattern STRONG_PASSWORD =
        Pattern.compile("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?]).{8,}$");

    private final UserRepository          userRepository;
    private final ChildRepository         childRepository;
    private final ApiQuotaService         quotaService;
    private final AiUsageLogRepository    usageLogRepository;
    private final PasswordEncoder         encoder;
    private final FeatureConfigRepository       featureConfigRepo;
    private final UserFeatureOverrideRepository overrideRepo;
    private final com.glumbi.service.AccountDeletionService accountDeletionService;

    @GetMapping("/me/quota")
    @Transactional
    public ResponseEntity<?> getQuota(@AuthenticationPrincipal AuthUser authUser) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int limit = user.getQuotaLimit() > 0 ? user.getQuotaLimit() : quotaService.getDefaultMonthlyCredits();
        java.time.YearMonth nowMonth = java.time.YearMonth.now();
        String thisMonth = nowMonth.toString();
        java.time.LocalDateTime monthStart = nowMonth.atDay(1).atStartOfDay();
        java.time.LocalDateTime monthEnd   = nowMonth.atEndOfMonth().atTime(23, 59, 59);
        // Atomically reset counter if month is stale — safe against concurrent consumeCredits calls
        userRepository.atomicResetIfStale(authUser.id(), thisMonth);
        long used = userRepository.findById(authUser.id())
            .map(u -> (long) u.getMonthlyApiCalls()).orElse(0L);
        long usedActual = usageLogRepository.sumCreditsByUser(authUser.id(), monthStart, monthEnd);
        return ResponseEntity.ok(Map.of(
            "used",        used,
            "usedActual",  usedActual,
            "limit",       limit,
            "month",       nowMonth.toString()
        ));
    }

    @GetMapping("/me/feature-credits")
    public ResponseEntity<?> getFeatureCredits(@AuthenticationPrincipal AuthUser authUser) {
        var overrideMap = overrideRepo.findByIdUserId(authUser.id()).stream()
            .collect(java.util.stream.Collectors.toMap(
                o -> o.getId().getFeatureName(), o -> o.isEnabled()
            ));
        var list = featureConfigRepo.findAll().stream()
            .map(fc -> {
                boolean effectivelyEnabled = fc.isEnabled() &&
                    overrideMap.getOrDefault(fc.getFeatureName(), true);
                return Map.of(
                    "featureName", (Object) fc.getFeatureName(),
                    "creditCost",  (Object) fc.getCreditCost(),
                    "description", (Object) (fc.getDescription() != null ? fc.getDescription() : ""),
                    "enabled",     (Object) effectivelyEnabled
                );
            })
            .toList();
        return ResponseEntity.ok(list);
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

    @GetMapping("/me/credit-breakdown")
    public ResponseEntity<?> getCreditBreakdown(@AuthenticationPrincipal AuthUser authUser) {
        List<Child> children = childRepository.findByOwnerId(authUser.id());

        YearMonth now = YearMonth.now();
        LocalDateTime monthStart = now.atDay(1).atStartOfDay();
        LocalDateTime monthEnd   = now.atEndOfMonth().atTime(23, 59, 59);

        // Build lookup: childId → featureName → {credits, count}
        var rows = usageLogRepository.sumByChildAndFeature(authUser.id(), monthStart, monthEnd);
        // rows: [childId, featureName, sumCredits, count]
        java.util.Map<Long, java.util.Map<String, long[]>> logMap = new java.util.HashMap<>();
        for (Object[] row : rows) {
            Long cid     = ((Number) row[0]).longValue();
            String feat  = (String) row[1];
            long credits = ((Number) row[2]).longValue();
            long count   = ((Number) row[3]).longValue();
            logMap.computeIfAbsent(cid, k -> new java.util.HashMap<>()).put(feat, new long[]{credits, count});
        }

        // Feature display metadata
        record FeatMeta(String label, String icon) {}
        java.util.Map<String, FeatMeta> meta = new java.util.HashMap<>();
        meta.put("story",             new FeatMeta("Stories",      "📖"));
        meta.put("story-listen",      new FeatMeta("Story Listen", "🔊"));
        meta.put("activity",          new FeatMeta("Activities",   "🎮"));
        meta.put("curiosity",         new FeatMeta("Curiosity",    "🔍"));
        meta.put("read-quiz",         new FeatMeta("Read & Quiz",  "📚"));
        meta.put("writing-coach",     new FeatMeta("My Writing",   "✍️"));
        meta.put("draw",              new FeatMeta("Drawing",      "🎨"));
        meta.put("memory-flashcards", new FeatMeta("Flashcards",   "🧠"));
        meta.put("memory-match",      new FeatMeta("Memory Match", "🃏"));
        meta.put("word-of-day",       new FeatMeta("Word of Day",  "✏️"));
        meta.put("draw-guide",        new FeatMeta("Draw Guide",   "🖌️"));
        meta.put("learn-validate",    new FeatMeta("Letter Check", "🔤"));
        meta.put("learn-word",        new FeatMeta("Learn Word",   "✏️"));
        meta.put("journal-ai",        new FeatMeta("Journal AI",   "📓"));
        meta.put("maze",              new FeatMeta("Maze",         "🌀"));
        meta.put("riddle",            new FeatMeta("Riddle",       "🧩"));
        meta.put("translation",       new FeatMeta("Translation",  "🌐"));

        var breakdown = children.stream().map(child -> {
            var childLog = logMap.getOrDefault(child.getId(), java.util.Map.of());
            long total = childLog.values().stream().mapToLong(v -> v[0]).sum();

            var features = childLog.entrySet().stream()
                .sorted(java.util.Map.Entry.<String, long[]>comparingByValue(
                    (a, b) -> Long.compare(b[0], a[0])))
                .map(e -> {
                    FeatMeta m = meta.getOrDefault(e.getKey(), new FeatMeta(e.getKey(), "⚙️"));
                    return Map.of(
                        "feature", (Object) e.getKey(),
                        "label",   (Object) m.label(),
                        "icon",    (Object) m.icon(),
                        "count",   (Object) e.getValue()[1],
                        "credits", (Object) e.getValue()[0]
                    );
                }).toList();

            return Map.of(
                "childId",      (Object) child.getId(),
                "name",         (Object) child.getName(),
                "avatarEmoji",  (Object) (child.getAvatarEmoji() != null ? child.getAvatarEmoji() : "🌟"),
                "theme",        (Object) (child.getTheme() != null ? child.getTheme() : "coral"),
                "totalCredits", (Object) total,
                "features",     (Object) features
            );
        }).toList();

        return ResponseEntity.ok(Map.of(
            "month",    now.toString(),
            "children", breakdown
        ));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal AuthUser authUser) {
        if ("SUPER_ADMIN".equals(authUser.role())) {
            long remaining = userRepository.countByRole(AppUser.Role.SUPER_ADMIN);
            if (remaining <= 1)
                return ResponseEntity.status(400).body(Map.of("error",
                    "You are the only super admin. Promote another admin first before deleting your account."));
        }
        accountDeletionService.deleteUser(authUser.id());
        return ResponseEntity.noContent().build();
    }
}
