package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.scheduler.NotificationScheduler;
import com.glumbi.service.ApiQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.glumbi.security.JwtFilter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository          userRepo;
    private final ChildRepository         childRepo;
    private final StoryRepository         storyRepo;
    private final ActivityRepository      activityRepo;
    private final JournalRepository       journalRepo;
    private final CuriosityRepository     curiosityRepo;
    private final ReadQuizRepository      quizRepo;
    private final WritingRepository       writingRepo;
    private final PasswordEncoder         encoder;
    private final NotificationScheduler   notificationScheduler;
    private final FeatureConfigRepository       featureConfigRepo;
    private final ApiQuotaService               quotaService;
    private final UserFeatureOverrideRepository overrideRepo;
    private final AppSettingRepository          appSettingRepo;
    private final SchedulerRunRepository        schedulerRunRepo;
    private final ObjectMapper                  objectMapper;
    private final FlashcardSetRepository        flashcardSetRepo;
    private final WordOfDayRepository           wordOfDayRepo;
    private final MemoryMatchRepository         memoryMatchRepo;
    private final AiUsageLogRepository          usageLogRepo;
    private final com.glumbi.service.AccountDeletionService accountDeletionService;

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
        long totalFlashcards = flashcardSetRepo.count();
        long totalWordOfDay  = wordOfDayRepo.count();
        long totalMemMatch   = memoryMatchRepo.count();

        featureUsage.put("Stories",       isAllTime ? totalStories    : storyRepo.countByCreatedAtAfter(since));
        featureUsage.put("Quizzes",       isAllTime ? totalQuizzes    : quizRepo.countByCreatedAtAfter(since));
        featureUsage.put("Writing",       isAllTime ? totalWritings   : writingRepo.countByCreatedAtAfter(since));
        featureUsage.put("Activities",    isAllTime ? totalActivities : activityRepo.countByCreatedAtAfter(since));
        featureUsage.put("Flashcards",    isAllTime ? totalFlashcards : flashcardSetRepo.countByCreatedAtAfter(since));
        featureUsage.put("Word of Day",   isAllTime ? totalWordOfDay  : wordOfDayRepo.countByCreatedAtAfter(since));
        featureUsage.put("Memory Match",  isAllTime ? totalMemMatch   : memoryMatchRepo.countByCreatedAtAfter(since));

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
            if (c.getBirthYear() == null) return;
            int age = com.glumbi.service.ChildService.ageFromBirthYear(c.getBirthYear());
            if (age < 3) return;
            String key = age >= 12 ? "12+" : String.valueOf(age);
            ageDistribution.computeIfPresent(key, (k, v) -> v + 1);
        });

        // Recent activity feed — merge across all feature tables, show newest 15
        List<Map<String, Object>> recentActivity = new ArrayList<>();
        storyRepo.findTop10ByOrderByCreatedAtDesc().forEach(s -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "story"); a.put("icon", "📖");
            a.put("label", "Story: " + s.getTitle());
            a.put("childName", s.getChild() != null ? s.getChild().getName() : "");
            a.put("createdAt", s.getCreatedAt().toString()); recentActivity.add(a);
        });
        curiosityRepo.findTop5ByOrderByCreatedAtDesc().forEach(c -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "curiosity"); a.put("icon", "🔍");
            a.put("label", "Asked: " + c.getQuestion());
            a.put("childName", c.getChild() != null ? c.getChild().getName() : "");
            a.put("createdAt", c.getCreatedAt().toString()); recentActivity.add(a);
        });
        quizRepo.findTop5ByCompletedTrueOrderByCreatedAtDesc().forEach(q -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "quiz"); a.put("icon", "📚");
            a.put("label", "Quiz: " + q.getTopic() + " — " + q.getScore() + "/3");
            a.put("childName", q.getChild() != null ? q.getChild().getName() : "");
            a.put("createdAt", q.getCreatedAt().toString()); recentActivity.add(a);
        });
        writingRepo.findTop5ByOrderByCreatedAtDesc().forEach(w -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "writing"); a.put("icon", "✍️");
            a.put("label", "Writing: " + w.getTitle());
            a.put("childName", w.getChild() != null ? w.getChild().getName() : "");
            a.put("createdAt", w.getCreatedAt().toString()); recentActivity.add(a);
        });
        activityRepo.findTop5ByCategoryNotOrderByCreatedAtDesc("learn").forEach(act -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "activity"); a.put("icon", act.getEmoji() != null ? act.getEmoji() : "🎮");
            a.put("label", "Activity: " + act.getTitle());
            a.put("childName", act.getChild() != null ? act.getChild().getName() : "");
            a.put("createdAt", act.getCreatedAt().toString()); recentActivity.add(a);
        });
        flashcardSetRepo.findTop5ByOrderByCreatedAtDesc().forEach(f -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "flashcards"); a.put("icon", "🧠");
            a.put("label", "Flashcards: " + f.getTopic());
            a.put("childName", f.getChild() != null ? f.getChild().getName() : "");
            a.put("createdAt", f.getCreatedAt().toString()); recentActivity.add(a);
        });
        wordOfDayRepo.findTop5ByOrderByCreatedAtDesc().forEach(w -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "wordofday"); a.put("icon", "📘");
            a.put("label", "Word of Day: " + w.getWord());
            a.put("childName", w.getChild() != null ? w.getChild().getName() : "");
            a.put("createdAt", w.getCreatedAt().toString()); recentActivity.add(a);
        });
        memoryMatchRepo.findTop5ByOrderByCreatedAtDesc().forEach(m -> {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("type", "memorymatch"); a.put("icon", "🃏");
            a.put("label", "Memory Match: " + m.getTheme());
            a.put("childName", m.getChild() != null ? m.getChild().getName() : "");
            a.put("createdAt", m.getCreatedAt().toString()); recentActivity.add(a);
        });
        recentActivity.sort((x, y) -> y.get("createdAt").toString().compareTo(x.get("createdAt").toString()));
        List<Map<String, Object>> recentActivityTrimmed = recentActivity.stream().limit(15).collect(Collectors.toList());

        // Quota overview — current month usage across all users
        String thisMonth = YearMonth.now().toString();
        YearMonth nowMonth = YearMonth.now();
        LocalDateTime monthStart = nowMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd   = nowMonth.atEndOfMonth().atTime(23, 59, 59);
        long totalQuotaCalls = usageLogRepo.sumCreditsInPeriod(monthStart, monthEnd);
        long usersAtLimit   = userRepo.findAll().stream()
            .filter(u -> u.getRole() == AppUser.Role.USER && thisMonth.equals(u.getApiCallMonth()))
            .filter(u -> { int lim = u.getQuotaLimit() > 0 ? u.getQuotaLimit() : quotaService.getDefaultMonthlyCredits(); return u.getMonthlyApiCalls() >= lim; })
            .count();
        long usersNearLimit = userRepo.findAll().stream()
            .filter(u -> u.getRole() == AppUser.Role.USER && thisMonth.equals(u.getApiCallMonth()))
            .filter(u -> { int lim = u.getQuotaLimit() > 0 ? u.getQuotaLimit() : quotaService.getDefaultMonthlyCredits(); return u.getMonthlyApiCalls() >= lim * 0.8 && u.getMonthlyApiCalls() < lim; })
            .count();

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
        result.put("recentActivity",      recentActivityTrimmed);
        result.put("alerts",              alerts);
        result.put("totalQuotaCalls",        totalQuotaCalls);
        result.put("usersAtLimit",           usersAtLimit);
        result.put("usersNearLimit",         usersNearLimit);
        result.put("defaultMonthlyCredits",  quotaService.getDefaultMonthlyCredits());
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
        String thisMonth = YearMonth.now().toString();
        return userRepo.findAll().stream().map(u -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id",          u.getId());
            m.put("email",       u.getEmail());
            m.put("role",        u.getRole().name());
            m.put("createdAt",   u.getCreatedAt());
            m.put("childCount",  (long) childRepo.findByOwnerId(u.getId()).size());
            m.put("authMethod",  u.getGoogleSub() != null ? "google" : "password");
            m.put("onHold",      u.isOnHold());
            m.put("holdReason",  u.getHoldReason());
            // Quota: reset month check (same logic as ApiQuotaService)
            int used  = thisMonth.equals(u.getApiCallMonth()) ? u.getMonthlyApiCalls() : 0;
            int limit = u.getQuotaLimit() > 0 ? u.getQuotaLimit() : quotaService.getDefaultMonthlyCredits();
            m.put("quotaUsed",   used);
            m.put("quotaLimit",  limit);
            return m;
        }).toList();
    }

    @PatchMapping("/users/{id}/quota/reset")
    @Transactional
    public ResponseEntity<?> resetQuota(@PathVariable Long id) {
        return userRepo.findById(id).map(u -> {
            u.setMonthlyApiCalls(0);
            u.setApiCallMonth(YearMonth.now().toString());
            userRepo.save(u);
            int limit = u.getQuotaLimit() > 0 ? u.getQuotaLimit() : quotaService.getDefaultMonthlyCredits();
            return ResponseEntity.ok(Map.of("quotaUsed", 0, "quotaLimit", limit));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/quota")
    @Transactional
    public ResponseEntity<?> setQuota(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        int newLimit = body.getOrDefault("limit", quotaService.getDefaultMonthlyCredits());
        if (newLimit < 0 || newLimit > 10000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Limit must be between 0 and 10000"));
        }
        return userRepo.findById(id).map(u -> {
            u.setQuotaLimit(newLimit);
            u.setMonthlyApiCalls(0);
            u.setApiCallMonth(YearMonth.now().toString());
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("quotaUsed", 0, "quotaLimit", newLimit));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Feature credit config ─────────────────────────────────────────────────

    @GetMapping("/feature-config")
    public List<Map<String, Object>> listFeatureConfigs() {
        return featureConfigRepo.findAll().stream().map(fc -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("featureName",  fc.getFeatureName());
            m.put("creditCost",   fc.getCreditCost());
            m.put("enabled",      fc.isEnabled());
            m.put("description",  fc.getDescription());
            return m;
        }).sorted(Comparator.comparing(m -> (String) m.get("featureName"))).toList();
    }

    @PutMapping("/feature-config/{featureName}")
    @Transactional
    public ResponseEntity<?> updateFeatureConfig(@PathVariable String featureName,
                                                 @RequestBody Map<String, Integer> body) {
        int cost = body.getOrDefault("creditCost", 1);
        if (cost < 1 || cost > 100) {
            return ResponseEntity.badRequest().body(Map.of("error", "Credit cost must be between 1 and 100"));
        }
        return featureConfigRepo.findById(featureName).map(fc -> {
            fc.setCreditCost(cost);
            featureConfigRepo.save(fc);
            return ResponseEntity.ok(Map.of("featureName", fc.getFeatureName(), "creditCost", fc.getCreditCost()));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Global feature toggle ──────────────────────────────────────────────────

    @PutMapping("/feature-config/{featureName}/enabled")
    @Transactional
    public ResponseEntity<?> setFeatureEnabled(@PathVariable String featureName,
                                               @RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", true);
        return featureConfigRepo.findById(featureName).map(fc -> {
            fc.setEnabled(enabled);
            featureConfigRepo.save(fc);
            return ResponseEntity.ok(Map.of("featureName", fc.getFeatureName(), "enabled", fc.isEnabled()));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Per-user feature overrides ─────────────────────────────────────────────

    @GetMapping("/users/{userId}/feature-overrides")
    public ResponseEntity<?> getUserFeatureOverrides(@PathVariable Long userId) {
        var overrides = overrideRepo.findByIdUserId(userId).stream()
            .map(o -> Map.of("featureName", (Object) o.getId().getFeatureName(), "enabled", (Object) o.isEnabled()))
            .toList();
        // Also include global state so UI has full picture in one call
        var globals = featureConfigRepo.findAll().stream()
            .map(fc -> Map.of(
                "featureName",     (Object) fc.getFeatureName(),
                "globallyEnabled", (Object) fc.isEnabled(),
                "creditCost",      (Object) fc.getCreditCost(),
                "description",     (Object) (fc.getDescription() != null ? fc.getDescription() : "")
            ))
            .toList();
        return ResponseEntity.ok(Map.of("overrides", overrides, "features", globals));
    }

    @PutMapping("/users/{userId}/feature-overrides/{featureName}")
    public ResponseEntity<?> setUserFeatureOverride(@PathVariable Long userId,
                                                    @PathVariable String featureName,
                                                    @RequestBody Map<String, Object> body) {
        if (!userRepo.existsById(userId)) return ResponseEntity.notFound().build();
        Object val = body.get("enabled");
        if (val == null) {
            // Reset to global default — remove override
            quotaService.removeUserFeatureOverride(userId, featureName);
            return ResponseEntity.ok(Map.of("featureName", featureName, "reset", true));
        }
        boolean enabled = Boolean.TRUE.equals(val);
        quotaService.setUserFeatureOverride(userId, featureName, enabled);
        return ResponseEntity.ok(Map.of("featureName", featureName, "enabled", enabled));
    }

    @GetMapping("/quota/default")
    public Map<String, Object> getQuotaDefaults() {
        return Map.of("defaultMonthlyCredits", quotaService.getDefaultMonthlyCredits());
    }

    @PutMapping("/quota/default")
    public ResponseEntity<?> setQuotaDefault(@RequestBody Map<String, Integer> body) {
        int credits = body.getOrDefault("defaultMonthlyCredits", 100);
        if (credits < 10 || credits > 10000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Default credits must be between 10 and 10000"));
        }
        quotaService.setDefaultMonthlyCredits(credits);
        return ResponseEntity.ok(Map.of("defaultMonthlyCredits", credits));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id,
                                        @AuthenticationPrincipal JwtFilter.AuthUser caller) {
        return userRepo.findById(id).map(u -> {
            if (u.isSuperAdmin())
                return ResponseEntity.status(403).body(Map.of("error", "Super admins cannot be deleted."));
            if (u.isAdminOrAbove() && !callerIsSuperAdmin(caller))
                return ResponseEntity.status(403).body(Map.of("error", "Only a super admin can delete another admin."));

            accountDeletionService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private static final java.util.regex.Pattern STRONG_PASSWORD =
        java.util.regex.Pattern.compile("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?]).{8,}$");

    @PatchMapping("/users/{id}/password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal JwtFilter.AuthUser caller) {
        String newPassword = body.get("password");
        if (newPassword == null || !STRONG_PASSWORD.matcher(newPassword).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                "Password must be at least 8 characters and include an uppercase letter, a number, and a special character"));
        }
        return userRepo.findById(id).map(u -> {
            if (u.isSuperAdmin() && !callerIsSuperAdmin(caller))
                return ResponseEntity.status(403).body(Map.of("error", "Only a super admin can reset another super admin's password."));
            if (u.isAdminOrAbove() && !callerIsSuperAdmin(caller))
                return ResponseEntity.status(403).body(Map.of("error", "Only a super admin can reset another admin's password."));
            u.setPasswordHash(encoder.encode(newPassword));
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("message", "Password updated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    private boolean callerIsSuperAdmin(JwtFilter.AuthUser caller) {
        return "SUPER_ADMIN".equals(caller.role());
    }

    @PostMapping("/notifications/run")
    public ResponseEntity<Map<String, String>> runNotifications() {
        new Thread(notificationScheduler::runWeeklyNotifications).start();
        return ResponseEntity.accepted().body(Map.of("message", "Weekly notifications triggered — running in background"));
    }

    @PostMapping("/scheduler/reset-credits")
    public ResponseEntity<Map<String, String>> runCreditReset() {
        new Thread(quotaService::resetAllMonthlyCounters).start();
        return ResponseEntity.accepted().body(Map.of("message", "Credit reset triggered — running in background"));
    }

    @GetMapping("/scheduler/status")
    public ResponseEntity<Map<String, Object>> schedulerStatus() {
        Map<String, Object> weeklyLastRun = parseLastRunLog(NotificationScheduler.LAST_RUN_KEY);
        return ResponseEntity.ok(Map.of(
            "schedulers", List.of(
                Map.of(
                    "id",          "reset-credits",
                    "label",       "Monthly Credit Reset",
                    "description", "Resets all users' monthly AI credit usage to 0. Normally runs automatically on the 1st of every month at midnight.",
                    "schedule",    "1st of every month, 00:00 UTC",
                    "endpoint",    "/api/admin/scheduler/reset-credits",
                    "lastRun",     Map.of()
                ),
                Map.of(
                    "id",          "weekly-notifications",
                    "label",       "Weekly Notifications",
                    "description", "Runs AI agents to generate progress reports, milestones, story recommendations and learning insights for all active children.",
                    "schedule",    "Every Sunday, 08:00 UTC",
                    "endpoint",    "/api/admin/notifications/run",
                    "lastRun",     weeklyLastRun
                )
            )
        ));
    }

    @GetMapping("/scheduler/{id}/history")
    public ResponseEntity<?> schedulerHistory(@PathVariable String id) {
        if (!Set.of("weekly-notifications", "reset-credits").contains(id))
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown scheduler: " + id));

        List<Map<String, Object>> history = schedulerRunRepo
            .findTop50BySchedulerIdOrderByStartedAtDesc(id)
            .stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",                r.getId());
                m.put("startedAt",         r.getStartedAt());
                m.put("finishedAt",        r.getFinishedAt());
                m.put("status",            r.getStatus());
                m.put("childrenProcessed", r.getChildrenProcessed());
                m.put("agentsRan",         parseJson(r.getAgentsRan()));
                m.put("agentsSkipped",     parseJson(r.getAgentsSkipped()));
                m.put("errors",            parseJson(r.getErrors()));
                return m;
            })
            .toList();

        return ResponseEntity.ok(Map.of("schedulerId", id, "history", history));
    }

    private Object parseJson(String json) {
        if (json == null) return List.of();
        try { return objectMapper.readValue(json, List.class); } catch (Exception e) { return List.of(); }
    }

    private Map<String, Object> parseLastRunLog(String key) {
        return appSettingRepo.findById(key).map(s -> {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> m = new LinkedHashMap<>(objectMapper.readValue(s.getValue(), Map.class));
                // Parse any fields that were stored as JSON strings instead of arrays
                for (String field : List.of("agentsRan", "agentsSkipped", "errors")) {
                    Object v = m.get(field);
                    if (v instanceof String str) {
                        try { m.put(field, objectMapper.readValue(str, List.class)); } catch (Exception ignored) {}
                    }
                }
                return m;
            } catch (Exception e) {
                return Map.<String, Object>of();
            }
        }).orElse(Map.of());
    }

    // ── AI Agent config ──────────────────────────────────────────────────────

    private static final List<Map<String, String>> AGENT_METADATA = List.of(
        Map.of("id", NotificationScheduler.AGENT_PROGRESS,  "label", "Progress Report",        "description", "Generates a weekly summary of each child's learning activity — stories, quizzes, and writing entries from the past 7 days."),
        Map.of("id", NotificationScheduler.AGENT_MILESTONE, "label", "Milestone Detection",    "description", "Scans all-time activity to detect achievements (e.g. first story, 10 quizzes) and sends a congratulatory notification."),
        Map.of("id", NotificationScheduler.AGENT_STORY_REC, "label", "Story Recommendation",   "description", "Analyses a child's reading history and suggests a new story theme tailored to their interests."),
        Map.of("id", NotificationScheduler.AGENT_LEARNING,  "label", "Learning Insight",       "description", "Reviews the last two weeks of quizzes and writing to surface patterns and tips for the parent."),
        Map.of("id", NotificationScheduler.AGENT_LEARN_WRITE, "label", "Learn to Write",       "description", "Summarises the letters and words a child practised writing this week and suggests what to try next."),
        Map.of("id", NotificationScheduler.AGENT_MEMORY,      "label", "Memory Play",           "description", "Reviews the child's flashcard sessions and words of the day from the past week and sends an encouraging memory activity summary.")
    );

    @GetMapping("/agents")
    public List<Map<String, Object>> listAgents() {
        return AGENT_METADATA.stream().map(meta -> {
            Map<String, Object> m = new LinkedHashMap<>(meta);
            m.put("enabled", notificationScheduler.isAgentEnabled(meta.get("id")));
            return m;
        }).toList();
    }

    @PutMapping("/agents/{id}/enabled")
    public ResponseEntity<?> setAgentEnabled(@PathVariable String id,
                                             @RequestBody Map<String, Boolean> body) {
        boolean validId = AGENT_METADATA.stream().anyMatch(m -> m.get("id").equals(id));
        if (!validId) return ResponseEntity.badRequest().body(Map.of("error", "Unknown agent: " + id));
        boolean enabled = body.getOrDefault("enabled", true);
        notificationScheduler.setAgentEnabled(id, enabled);
        return ResponseEntity.ok(Map.of("id", id, "enabled", enabled));
    }

    @PatchMapping("/users/{id}/hold")
    public ResponseEntity<?> holdUser(@PathVariable Long id,
                                      @RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal JwtFilter.AuthUser caller) {
        return userRepo.findById(id).map(u -> {
            if (u.isAdminOrAbove())
                return ResponseEntity.status(403).body(Map.of("error", "Admin and super admin accounts cannot be put on hold. Delete the account instead."));
            u.setOnHold(true);
            u.setHoldReason(body.getOrDefault("reason", "Account suspended by admin."));
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("email", u.getEmail(), "onHold", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/release")
    public ResponseEntity<?> releaseUser(@PathVariable Long id,
                                         @AuthenticationPrincipal JwtFilter.AuthUser caller) {
        return userRepo.findById(id).map(u -> {
            if (u.isAdminOrAbove())
                return ResponseEntity.status(403).body(Map.of("error", "Admin and super admin accounts cannot be held."));
            u.setOnHold(false);
            u.setHoldReason(null);
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("email", u.getEmail(), "onHold", false));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id,
                                        @RequestBody Map<String, String> body,
                                        @AuthenticationPrincipal JwtFilter.AuthUser caller) {
        if (!callerIsSuperAdmin(caller))
            return ResponseEntity.status(403).body(Map.of("error", "Only a super admin can change roles."));
        return userRepo.findById(id).map(u -> {
            if (u.getId().equals(caller.id()))
                return ResponseEntity.status(403).body(Map.of("error", "You cannot change your own role."));
            AppUser.Role newRole = AppUser.Role.valueOf(body.get("role").toUpperCase());
            // Only allow promoting/demoting between ADMIN and SUPER_ADMIN via this endpoint
            if (newRole == AppUser.Role.USER)
                return ResponseEntity.status(403).body(Map.of("error", "Cannot demote an admin to a regular user."));
            u.setRole(newRole);
            userRepo.save(u);
            return ResponseEntity.ok(Map.of("email", u.getEmail(), "role", u.getRole().name()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || email.isBlank() || password == null || password.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        if (userRepo.findByEmail(email.toLowerCase().trim()).isPresent())
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists."));
        AppUser admin = new AppUser();
        admin.setEmail(email.toLowerCase().trim());
        admin.setPasswordHash(encoder.encode(password));
        admin.setRole(AppUser.Role.ADMIN);
        userRepo.save(admin);
        return ResponseEntity.ok(Map.of("email", admin.getEmail(), "role", "ADMIN"));
    }

    @PostMapping("/super-admins")
    public ResponseEntity<?> createSuperAdmin(@RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal JwtFilter.AuthUser caller) {
        if (!callerIsSuperAdmin(caller))
            return ResponseEntity.status(403).body(Map.of("error", "Only a super admin can create another super admin."));
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || email.isBlank() || password == null || password.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        if (userRepo.findByEmail(email.toLowerCase().trim()).isPresent())
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists."));
        AppUser admin = new AppUser();
        admin.setEmail(email.toLowerCase().trim());
        admin.setPasswordHash(encoder.encode(password));
        admin.setRole(AppUser.Role.SUPER_ADMIN);
        userRepo.save(admin);
        return ResponseEntity.ok(Map.of("email", admin.getEmail(), "role", "SUPER_ADMIN"));
    }
}
