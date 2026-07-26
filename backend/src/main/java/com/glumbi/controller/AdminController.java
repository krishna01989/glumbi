package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.scheduler.NotificationScheduler;
import com.glumbi.scheduler.QuotaScheduler;
import com.glumbi.service.ApiQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.glumbi.security.JwtFilter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository          userRepo;
    private final ChildRepository         childRepo;
    private final StoryRepository         storyRepo;
    private final ActivityRepository      activityRepo;
    private final ReadQuizRepository      quizRepo;
    private final WritingRepository       writingRepo;
    private final PasswordEncoder         encoder;
    private final NotificationScheduler   notificationScheduler;
    private final FeatureConfigRepository       featureConfigRepo;
    private final ApiQuotaService               quotaService;
    private final QuotaScheduler                quotaScheduler;
    private final UserFeatureOverrideRepository overrideRepo;
    private final AppSettingRepository          appSettingRepo;
    private final SchedulerRunRepository        schedulerRunRepo;
    private final ObjectMapper                  objectMapper;
    private final FlashcardSetRepository        flashcardSetRepo;
    private final WordOfDayRepository           wordOfDayRepo;
    private final MemoryMatchRepository         memoryMatchRepo;
    private final AiUsageLogRepository          usageLogRepo;
    private final com.glumbi.service.AccountDeletionService accountDeletionService;
    private final com.glumbi.service.ResendClient     resendClient;
    private final com.glumbi.service.EmailTemplates   emailTemplates;
    private final com.glumbi.service.VendorConfigService vendorConfigService;

    @GetMapping("/stats")
    public Map<String, Object> stats(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter dayFmt  = DateTimeFormatter.ofPattern("MMM d");
        DateTimeFormatter monFmt  = DateTimeFormatter.ofPattern("MMM yy");

        LocalDate fromDate = from != null ? LocalDate.parse(from) : LocalDate.now().minusDays(6);
        LocalDate toDate   = to   != null ? LocalDate.parse(to)   : LocalDate.now();
        LocalDateTime since = fromDate.atStartOfDay();
        long spanDays = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        // bucket mode: ≤14d→daily, ≤90d→weekly, else→monthly
        String bucketMode = spanDays <= 14 ? "daily" : spanDays <= 90 ? "weekly" : "monthly";

        LocalDateTime week = now.minusDays(7);

        // Totals (always all-time — unaffected by date filter)
        long totalUsers      = userRepo.countByRole(AppUser.Role.USER);
        long totalChildren   = childRepo.count();
        long totalStories    = storyRepo.count();
        long totalQuizzes    = quizRepo.count();
        long totalWritings   = writingRepo.count();
        long totalActivities = activityRepo.count();

        // New in selected range (for stat card sub-labels)
        long newUsersInRange    = userRepo.countByRoleAndCreatedAtAfter(AppUser.Role.USER, since);
        long newStoriesInRange  = storyRepo.countByCreatedAtAfter(since);
        long newChildrenInRange = childRepo.countByCreatedAtAfter(since);

        // Users with no children (alerts)
        long usersNoChildren = userRepo.countUsersWithNoChildren();

        // Build ordered bucket keys based on span
        Map<String, Long> signupsByDay = buildBuckets(fromDate, toDate, bucketMode, dayFmt, monFmt);
        Map<String, Long> contentByDay = buildBuckets(fromDate, toDate, bucketMode, dayFmt, monFmt);

        // Fill signups buckets
        userRepo.findByRoleAndCreatedAtAfter(AppUser.Role.USER, since)
            .forEach(u -> fillBucket(signupsByDay, u.getCreatedAt(), fromDate, toDate, bucketMode, dayFmt, monFmt));

        // Fill content (stories) buckets
        storyRepo.findByCreatedAtAfter(since).forEach(s ->
            fillBucket(contentByDay, s.getCreatedAt(), fromDate, toDate, bucketMode, dayFmt, monFmt));

        // Feature usage — filtered by selected range
        Map<String, Long> featureUsage = new LinkedHashMap<>();
        featureUsage.put("Stories",       storyRepo.countByCreatedAtAfter(since));
        featureUsage.put("Quizzes",       quizRepo.countByCreatedAtAfter(since));
        featureUsage.put("Writing",       writingRepo.countByCreatedAtAfter(since));
        featureUsage.put("Activities",    activityRepo.countByCreatedAtAfter(since));
        featureUsage.put("Flashcards",    flashcardSetRepo.countByCreatedAtAfter(since));
        featureUsage.put("Word of Day",   wordOfDayRepo.countByCreatedAtAfter(since));
        featureUsage.put("Memory Match",  memoryMatchRepo.countByCreatedAtAfter(since));

        // Quiz score distribution — filtered by selected range
        Map<String, Long> quizScores = new LinkedHashMap<>();
        quizScores.put("1/3", 0L);
        quizScores.put("2/3", 0L);
        quizScores.put("3/3", 0L);
        quizRepo.countByScoreAfter(since).forEach(row -> {
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

        // Children age distribution (ages 1–10)
        Map<String, Long> ageDistribution = new LinkedHashMap<>();
        for (int age = 1; age <= 10; age++) ageDistribution.put(String.valueOf(age), 0L);
        childRepo.countByBirthYear().forEach(row -> {
            int birthYear = ((Number) row[0]).intValue();
            long cnt      = ((Number) row[1]).longValue();
            int age = com.glumbi.service.ChildService.ageFromBirthYear(birthYear);
            if (age < 1 || age > 10) return;
            ageDistribution.computeIfPresent(String.valueOf(age), (k, v) -> v + cnt);
        });

        // Quota overview — current month usage across all users
        String thisMonth = YearMonth.now().toString();
        YearMonth nowMonth = YearMonth.now();
        LocalDateTime monthStart = nowMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd   = nowMonth.atEndOfMonth().atTime(23, 59, 59);
        long totalQuotaCalls = usageLogRepo.sumCreditsInPeriod(monthStart, monthEnd);
        int defaultLimit    = quotaService.getDefaultMonthlyCredits();
        long usersAtLimit   = userRepo.countUsersAtQuotaLimit(thisMonth, defaultLimit);
        long usersNearLimit = userRepo.countUsersNearQuotaLimit(thisMonth, defaultLimit);

        // Alerts — always based on 7-day window regardless of selected range
        long newUsersThisWeek = userRepo.countByRoleAndCreatedAtAfter(AppUser.Role.USER, week);
        List<Map<String, String>> alerts = new ArrayList<>();
        if (usersNoChildren > 0)
            alerts.add(Map.of("level", "warn", "msg", usersNoChildren + " user(s) signed up but haven't added a child yet"));
        if (newUsersThisWeek == 0)
            alerts.add(Map.of("level", "info", "msg", "No new signups this week"));
        if (newUsersThisWeek >= 5)
            alerts.add(Map.of("level", "success", "msg", newUsersThisWeek + " new users joined this week 🎉"));
        long perfectScores = quizScores.getOrDefault("3/3", 0L);
        long scoredTotal   = quizScores.values().stream().mapToLong(Long::longValue).sum();
        if (scoredTotal >= 5 && perfectScores * 100 / scoredTotal < 30)
            alerts.add(Map.of("level", "warn", "msg", perfectScores + " of " + scoredTotal + " quizzes scored 3/3 (" + (perfectScores * 100 / scoredTotal) + "%) — content may be too hard"));

        String rangeLabel = spanDays == 1 ? "Today"
                : spanDays <= 14 ? "Last " + spanDays + " Days"
                : spanDays <= 45 ? "Last 30 Days"
                : spanDays <= 120 ? "Last 90 Days"
                : spanDays <= 370 ? "Last Year"
                : "Custom Range";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("from",                fromDate.toString());
        result.put("to",                  toDate.toString());
        result.put("rangeLabel",          rangeLabel);
        result.put("totalUsers",          totalUsers);
        result.put("totalChildren",       totalChildren);
        result.put("totalStories",        totalStories);
        result.put("totalQuizzes",        totalQuizzes);
        result.put("totalWritings",       totalWritings);
        result.put("totalActivities",     totalActivities);
        result.put("newUsersInRange",     newUsersInRange);
        result.put("newStoriesInRange",   newStoriesInRange);
        result.put("newChildrenInRange",  newChildrenInRange);
        result.put("signupsByDay",        signupsByDay);
        result.put("contentByDay",        contentByDay);
        result.put("featureUsage",        featureUsage);
        result.put("quizScoreDistribution", quizScores);
        result.put("engagementBuckets",   engagementBuckets);
        result.put("ageDistribution",     ageDistribution);
        result.put("alerts",              alerts);
        result.put("totalQuotaCalls",        totalQuotaCalls);
        result.put("usersAtLimit",           usersAtLimit);
        result.put("usersNearLimit",         usersNearLimit);
        result.put("defaultMonthlyCredits",  quotaService.getDefaultMonthlyCredits());
        return result;
    }

    // ── Chart bucketing helpers ───────────────────────────────────────────────

    private Map<String, Long> buildBuckets(LocalDate from, LocalDate to, String mode,
                                           DateTimeFormatter dayFmt, DateTimeFormatter monFmt) {
        Map<String, Long> m = new LinkedHashMap<>();
        switch (mode) {
            case "weekly" -> {
                // Weekly anchors: every 7 days from 'from'
                for (LocalDate anchor = from; !anchor.isAfter(to); anchor = anchor.plusWeeks(1))
                    m.put(anchor.format(dayFmt), 0L);
            }
            case "monthly" -> {
                for (LocalDate d = from.withDayOfMonth(1); !d.isAfter(to); d = d.plusMonths(1))
                    m.put(d.format(monFmt), 0L);
            }
            default -> { // daily
                for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1))
                    m.put(d.format(dayFmt), 0L);
            }
        }
        return m;
    }

    private void fillBucket(Map<String, Long> buckets, LocalDateTime ts,
                            LocalDate from, LocalDate to, String mode,
                            DateTimeFormatter dayFmt, DateTimeFormatter monFmt) {
        String key = switch (mode) {
            case "weekly" -> {
                // Find the weekly anchor ts falls into
                for (LocalDate anchor = from; !anchor.isAfter(to); anchor = anchor.plusWeeks(1)) {
                    LocalDate next = anchor.plusWeeks(1);
                    if (!ts.toLocalDate().isBefore(anchor) && ts.toLocalDate().isBefore(next)) {
                        yield anchor.format(dayFmt);
                    }
                }
                yield null;
            }
            case "monthly" -> ts.format(monFmt);
            default        -> ts.toLocalDate().format(dayFmt);
        };
        if (key != null) buckets.computeIfPresent(key, (k, v) -> v + 1);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        String thisMonth = YearMonth.now().toString();
        YearMonth nowMonth = YearMonth.now();
        LocalDateTime monthStart = nowMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd   = nowMonth.atEndOfMonth().atTime(23, 59, 59);

        // Load all per-user log totals in one query
        Map<Long, Long> logTotals = new HashMap<>();
        for (Object[] row : usageLogRepo.sumPerUserInPeriod(monthStart, monthEnd)) {
            logTotals.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }

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
            int used  = thisMonth.equals(u.getApiCallMonth()) ? u.getMonthlyApiCalls() : 0;
            int limit = u.getQuotaLimit() > 0 ? u.getQuotaLimit() : quotaService.getDefaultMonthlyCredits();
            m.put("quotaUsed",        used);
            m.put("quotaLimit",       limit);
            m.put("quotaUsedActual",  logTotals.getOrDefault(u.getId(), 0L));
            return m;
        }).toList();
    }

    @PatchMapping("/users/{id}/quota/reset")
    @Transactional
    public ResponseEntity<?> resetQuota(@PathVariable Long id) {
        return userRepo.findById(id).map(u -> {
            String thisMonth = YearMonth.now().toString();
            u.setMonthlyApiCalls(0);
            u.setApiCallMonth(thisMonth);
            u.setQuotaWarnMonth(null);
            u.setQuotaExhaustedMonth(null);
            u.setLastResetMonth(thisMonth);
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
            userRepo.save(u);
            String thisMonth = YearMonth.now().toString();
            int used = thisMonth.equals(u.getApiCallMonth()) ? u.getMonthlyApiCalls() : 0;
            return ResponseEntity.ok(Map.of("quotaUsed", used, "quotaLimit", newLimit));
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

            String email = u.getEmail();
            boolean isAppUser = !u.isAdminOrAbove();
            accountDeletionService.deleteUser(id);
            if (isAppUser) resendClient.send(email, "Your Glumbi account has been removed", emailTemplates.accountDeletedByAdmin());
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
            resendClient.send(
                u.getEmail(),
                "Your Glumbi password was changed",
                emailTemplates.passwordChanged("by an administrator", u.isAdminOrAbove())
            );
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
        new Thread(quotaScheduler::resetAllMonthlyCounters).start();
        return ResponseEntity.accepted().body(Map.of("message", "Credit reset triggered — running in background"));
    }

    @GetMapping("/scheduler/status")
    public ResponseEntity<Map<String, Object>> schedulerStatus() {
        Map<String, Object> weeklyLastRun      = parseLastRunLog(NotificationScheduler.LAST_RUN_KEY);
        Map<String, Object> creditResetLastRun = parseLastRunLog(QuotaScheduler.LAST_RUN_KEY);
        return ResponseEntity.ok(Map.of(
            "schedulers", List.of(
                Map.of(
                    "id",          "reset-credits",
                    "label",       "Monthly Credit Reset",
                    "description", "Resets all users' monthly AI credit usage to 0. Normally runs automatically on the 1st of every month at midnight.",
                    "schedule",    "1st of every month, 00:00 UTC",
                    "endpoint",    "/api/admin/scheduler/reset-credits",
                    "lastRun",     creditResetLastRun
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

    // ── Consent backfill ──────────────────────────────────────────────────────

    private static final String BACKFILL_HISTORY_KEY = "compliance.consent-backfill.history";

    @PostMapping("/consent-backfill/send")
    public ResponseEntity<?> sendConsentBackfill() {
        List<AppUser> targets = userRepo.findUsersWithChildrenAndNoConsent();
        int sent    = 0;
        int skipped = 0;

        if (!targets.isEmpty()) {
            List<String> recipients = targets.stream()
                .map(AppUser::getEmail)
                .filter(e -> e != null && !e.isBlank())
                .collect(Collectors.toList());
            sent    = recipients.size();
            skipped = targets.size() - recipients.size();

            String subject = "A quick note about your child's data on Glumbi";
            String html    = emailTemplates.parentNotice();
            CompletableFuture.runAsync(() -> resendClient.sendBatch(recipients, subject, html));
        }

        Map<String, Object> record = new LinkedHashMap<>();
        record.put("ranAt",   LocalDateTime.now(java.time.ZoneOffset.UTC).toString());
        record.put("sent",    sent);
        record.put("skipped", skipped);
        com.glumbi.scheduler.SchedulerHistoryHelper.append(appSettingRepo, objectMapper, BACKFILL_HISTORY_KEY, record);

        return ResponseEntity.ok(Map.of("sent", sent, "skipped", skipped));
    }

    @GetMapping("/consent-backfill/history")
    public ResponseEntity<?> consentBackfillHistory() {
        List<Map<String, Object>> history =
            com.glumbi.scheduler.SchedulerHistoryHelper.read(appSettingRepo, objectMapper, BACKFILL_HISTORY_KEY);
        return ResponseEntity.ok(Map.of("history", history));
    }

    // ── Announcements ─────────────────────────────────────────────────────────

    @PostMapping("/announcements/send")
    public ResponseEntity<?> sendAnnouncement(@RequestBody Map<String, String> body) {
        String subject  = body.get("subject");
        String headline = body.get("headline");
        String bodyHtml = body.get("bodyHtml");
       
        if (subject == null || subject.isBlank() || headline == null || headline.isBlank() || bodyHtml == null || bodyHtml.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "subject, headline and bodyHtml are required"));

        List<AppUser> allUsers = userRepo.findAll();
        List<String> recipients = allUsers.stream()
            .filter(u -> !u.isAdminOrAbove())
            .filter(AppUser::isMarketingEmailsEnabled)
            .map(AppUser::getEmail)
            .filter(e -> e != null && !e.isBlank())
            .collect(Collectors.toList());

        int total = recipients.size();
        String html = emailTemplates.announcement(headline, bodyHtml);

        CompletableFuture.runAsync(() -> resendClient.sendBatch(recipients, subject, html));

        return ResponseEntity.ok(Map.of("queued", total));
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
        Map.of("id", NotificationScheduler.AGENT_MEMORY,      "label", "Memory Play",           "description", "Reviews the child's flashcard sessions, words of the day, and memory match games from the past week and sends an encouraging summary."),
        Map.of("id", NotificationScheduler.AGENT_CURIOSITY,   "label", "Curiosity Insight",      "description", "Highlights the questions a child asked this week and celebrates their curiosity with a warm parent notification."),
        Map.of("id", NotificationScheduler.AGENT_JOURNAL,     "label", "Journal Insight",        "description", "Summarises the child's journaling activity and mood trend from the past week.")
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

    // ── Vendor kill switches ─────────────────────────────────────────────────

    @GetMapping("/vendors")
    public List<Map<String, Object>> getVendors() {
        return vendorConfigService.getAll();
    }

    @PatchMapping("/vendors/{vendor}")
    public ResponseEntity<?> setVendor(@PathVariable String vendor,
                                       @RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) return ResponseEntity.badRequest().body(Map.of("error", "enabled field required"));
        List<String> known = List.of("anthropic", "google_tts", "elevenlabs", "resend", "voyage", "r2");
        if (!known.contains(vendor)) return ResponseEntity.badRequest().body(Map.of("error", "Unknown vendor: " + vendor));
        vendorConfigService.setEnabled(vendor, enabled);
        return ResponseEntity.ok(Map.of("vendor", vendor, "enabled", enabled));
    }

    @PatchMapping("/users/{id}/hold")
    public ResponseEntity<?> holdUser(@PathVariable Long id,
                                      @RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal JwtFilter.AuthUser caller) {
        return userRepo.findById(id).map(u -> {
            if (u.isAdminOrAbove())
                return ResponseEntity.status(403).body(Map.of("error", "Admin and super admin accounts cannot be put on hold. Delete the account instead."));
            u.setOnHold(true);
            String reason = body.getOrDefault("reason", "Account suspended by admin.");
            u.setHoldReason(reason);
            userRepo.save(u);
            resendClient.send(u.getEmail(), "Your Glumbi account has been suspended", emailTemplates.accountOnHold());
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
            resendClient.send(u.getEmail(), "Your Glumbi account has been reinstated", emailTemplates.accountReleased());
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
        if (!email.contains("@") || !email.contains("."))
            return ResponseEntity.badRequest().body(Map.of("error", "Valid email address required."));
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
        if (!email.contains("@") || !email.contains("."))
            return ResponseEntity.badRequest().body(Map.of("error", "Valid email address required."));
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
