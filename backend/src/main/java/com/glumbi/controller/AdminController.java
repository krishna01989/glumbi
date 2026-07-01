package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.entity.Story;
import com.glumbi.repository.*;
import com.glumbi.scheduler.NotificationScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository         userRepo;
    private final ChildRepository        childRepo;
    private final StoryRepository        storyRepo;
    private final ActivityRepository     activityRepo;
    private final JournalRepository      journalRepo;
    private final CuriosityRepository    curiosityRepo;
    private final ReadQuizRepository     quizRepo;
    private final WritingRepository      writingRepo;
    private final NotificationRepository notificationRepo;
    private final PasswordEncoder        encoder;
    private final NotificationScheduler  notificationScheduler;

    @GetMapping("/stats")
    public Map<String, Object> stats(@RequestParam(defaultValue = "7d") String range) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter dayFmt  = DateTimeFormatter.ofPattern("MMM d");
        DateTimeFormatter monFmt  = DateTimeFormatter.ofPattern("MMM yy");

        // Resolve "since" cutoff and chart bucket mode
        LocalDateTime since = switch (range) {
            case "30d" -> now.minusDays(30);
            case "90d" -> now.minusDays(90);
            case "all" -> now.minusYears(2);
            default    -> now.minusDays(7);   // 7d
        };
        // For backwards compat keep "week" alias used in alerts
        LocalDateTime week = now.minusDays(7);

        // Totals
        long totalUsers      = userRepo.count();
        long totalChildren   = childRepo.count();
        long totalStories    = storyRepo.count();
        long totalQuizzes    = quizRepo.count();
        long totalWritings   = writingRepo.count();
        long totalActivities = activityRepo.count();

        // New in selected range (for stat card sub-labels)
        long newUsersWeek    = userRepo.countByCreatedAtAfter(since);
        long newStoriesWeek  = storyRepo.countByCreatedAtAfter(since);
        long newChildrenWeek = childRepo.countByCreatedAtAfter(since);

        // Users with no children (alerts)
        Set<Long> ownersWithChildren = new HashSet<>(childRepo.findOwnerIdsWithChildren());
        long usersNoChildren = userRepo.findAll().stream()
                .filter(u -> u.getRole() == AppUser.Role.USER && !ownersWithChildren.contains(u.getId()))
                .count();

        // Build ordered bucket keys based on range
        // 7d/30d → daily, 90d → weekly (every 7 days), all → monthly
        Map<String, Long> signupsByDay = buildBuckets(now, range, dayFmt, monFmt);
        Map<String, Long> contentByDay = buildBuckets(now, range, dayFmt, monFmt);

        // Fill signups buckets
        userRepo.findAll().stream()
            .filter(u -> u.getCreatedAt().isAfter(since))
            .forEach(u -> fillBucket(signupsByDay, u.getCreatedAt(), now, range, dayFmt, monFmt));

        // Fill content (stories) buckets
        storyRepo.findByCreatedAtAfter(since).forEach(s ->
            fillBucket(contentByDay, s.getCreatedAt(), now, range, dayFmt, monFmt));

        // Feature usage — filtered by selected range
        boolean isAllTime = range.equals("all");
        Map<String, Long> featureUsage = new LinkedHashMap<>();
        featureUsage.put("Stories",    isAllTime ? totalStories    : storyRepo.countByCreatedAtAfter(since));
        featureUsage.put("Quizzes",    isAllTime ? totalQuizzes    : quizRepo.countByCreatedAtAfter(since));
        featureUsage.put("Writing",    isAllTime ? totalWritings   : writingRepo.countByCreatedAtAfter(since));
        featureUsage.put("Activities", isAllTime ? totalActivities : activityRepo.countByCreatedAtAfter(since));

        // Quiz score distribution — filtered by selected range
        Map<String, Long> quizScores = new LinkedHashMap<>();
        quizScores.put("1/3", 0L);
        quizScores.put("2/3", 0L);
        quizScores.put("3/3", 0L);
        (isAllTime ? quizRepo.countByScore() : quizRepo.countByScoreAfter(since)).forEach(row -> {
            int score = ((Number) row[0]).intValue();
            long cnt  = ((Number) row[1]).longValue();
            if (score >= 1 && score <= 3) quizScores.put(score + "/3", cnt);
        });

        // Engagement depth — users bucketed by story count
        Map<Long, Long> storiesPerChild = new HashMap<>();
        storyRepo.countStoriesPerChild().forEach(row ->
            storiesPerChild.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue())
        );
        long eng0  = Math.max(0, totalChildren - storiesPerChild.size());
        long eng1  = storiesPerChild.values().stream().filter(v -> v >= 1  && v <= 5).count();
        long eng2  = storiesPerChild.values().stream().filter(v -> v >= 6  && v <= 15).count();
        long eng3  = storiesPerChild.values().stream().filter(v -> v > 15).count();
        Map<String, Long> engagementBuckets = new LinkedHashMap<>();
        engagementBuckets.put("No stories",  eng0);
        engagementBuckets.put("1–5",         eng1);
        engagementBuckets.put("6–15",        eng2);
        engagementBuckets.put("15+",         eng3);

        // Children age distribution (ages 3–12+)
        Map<String, Long> ageDistribution = new LinkedHashMap<>();
        for (int age = 3; age <= 11; age++) ageDistribution.put(String.valueOf(age), 0L);
        ageDistribution.put("12+", 0L);
        childRepo.findAll().forEach(c -> {
            if (c.getBirthDate() == null) return;
            int age = java.time.Period.between(c.getBirthDate(), java.time.LocalDate.now()).getYears();
            if (age < 3) return;
            String key = age >= 12 ? "12+" : String.valueOf(age);
            ageDistribution.computeIfPresent(key, (k, v) -> v + 1);
        });

        // Recent activity feed — last 10 stories
        List<Map<String, Object>> recentActivity = storyRepo.findTop10ByOrderByCreatedAtDesc()
                .stream().map(s -> {
                    Map<String, Object> a = new LinkedHashMap<>();
                    a.put("type",      "story");
                    a.put("icon",      "📖");
                    a.put("label",     "Story generated: " + s.getTitle());
                    a.put("childName", s.getChild() != null ? s.getChild().getName() : "");
                    a.put("createdAt", s.getCreatedAt().toString());
                    return a;
                }).collect(Collectors.toList());

        // Alerts — always based on 7-day window regardless of selected range
        long newUsersThisWeek = userRepo.countByCreatedAtAfter(week);
        List<Map<String, String>> alerts = new ArrayList<>();
        if (usersNoChildren > 0)
            alerts.add(Map.of("level", "warn", "msg", usersNoChildren + " user(s) signed up but haven't added a child yet"));
        if (newUsersThisWeek == 0)
            alerts.add(Map.of("level", "info", "msg", "No new signups this week"));
        if (newUsersThisWeek >= 5)
            alerts.add(Map.of("level", "success", "msg", newUsersThisWeek + " new users joined this week 🎉"));
        long perfectScores = quizScores.getOrDefault("3/3", 0L);
        long scoredTotal   = quizScores.values().stream().mapToLong(Long::longValue).sum();
        if (scoredTotal > 0 && perfectScores * 100 / scoredTotal < 30)
            alerts.add(Map.of("level", "warn", "msg", "Only " + (perfectScores * 100 / scoredTotal) + "% of quizzes scored 3/3 — content may be too hard"));

        String rangeLabel = switch (range) {
            case "30d" -> "Last 30 Days";
            case "90d" -> "Last 90 Days";
            case "all" -> "All Time";
            default    -> "Last 7 Days";
        };

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("range",               range);
        result.put("rangeLabel",          rangeLabel);
        result.put("totalUsers",          totalUsers);
        result.put("totalChildren",       totalChildren);
        result.put("totalStories",        totalStories);
        result.put("totalQuizzes",        totalQuizzes);
        result.put("totalWritings",       totalWritings);
        result.put("totalActivities",     totalActivities);
        result.put("newUsersInRange",     newUsersWeek);
        result.put("newStoriesInRange",   newStoriesWeek);
        result.put("newChildrenInRange",  newChildrenWeek);
        result.put("signupsByDay",        signupsByDay);
        result.put("contentByDay",        contentByDay);
        result.put("featureUsage",        featureUsage);
        result.put("quizScoreDistribution", quizScores);
        result.put("engagementBuckets",   engagementBuckets);
        result.put("ageDistribution",     ageDistribution);
        result.put("recentActivity",      recentActivity);
        result.put("alerts",              alerts);
        return result;
    }

    // ── Chart bucketing helpers ───────────────────────────────────────────────

    private Map<String, Long> buildBuckets(LocalDateTime now, String range,
                                           DateTimeFormatter dayFmt, DateTimeFormatter monFmt) {
        Map<String, Long> m = new LinkedHashMap<>();
        switch (range) {
            case "30d" -> { for (int i = 29; i >= 0; i--) m.put(now.minusDays(i).format(dayFmt), 0L); }
            case "90d" -> { for (int i = 12; i >= 0; i--) m.put(now.minusWeeks(i).format(dayFmt), 0L); }
            case "all" -> { for (int i = 11; i >= 0; i--) m.put(now.minusMonths(i).format(monFmt), 0L); }
            default    -> { for (int i = 6;  i >= 0; i--) m.put(now.minusDays(i).format(dayFmt),  0L); }
        }
        return m;
    }

    private void fillBucket(Map<String, Long> buckets, LocalDateTime ts, LocalDateTime now,
                            String range, DateTimeFormatter dayFmt, DateTimeFormatter monFmt) {
        String key = switch (range) {
            case "90d" -> {
                // Find the Monday of the week ts falls in (among the 13 weekly anchors)
                for (int i = 12; i >= 0; i--) {
                    LocalDateTime anchor = now.minusWeeks(i);
                    if (!ts.isBefore(anchor.minusDays(3).toLocalDate().atStartOfDay()) &&
                         ts.isBefore(anchor.plusDays(4).toLocalDate().atStartOfDay())) {
                        yield anchor.format(dayFmt);
                    }
                }
                yield null;
            }
            case "all" -> ts.format(monFmt);
            default    -> ts.format(dayFmt);
        };
        if (key != null) buckets.computeIfPresent(key, (k, v) -> v + 1);
    }

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

    @PostMapping("/notifications/run")
    public ResponseEntity<Map<String, String>> runNotifications() {
        notificationScheduler.runWeeklyNotifications();
        return ResponseEntity.ok(Map.of("message", "Notification run completed"));
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
