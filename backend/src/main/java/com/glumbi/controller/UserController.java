package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.repository.*;
import com.glumbi.repository.FeatureConfigRepository;
import com.glumbi.repository.UserFeatureOverrideRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.AdminAlertService;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.EmailTemplates;
import com.glumbi.service.ResendClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final com.glumbi.service.PromoCreditService promoCreditService;
    private final ResendClient  resendClient;
    private final EmailTemplates emailTemplates;
    private final AdminAlertService adminAlertService;
    private final StoryRepository         storyRepository;
    private final JournalRepository       journalRepository;
    private final DrawSaveRepository      drawSaveRepository;
    private final WritingRepository       writingRepository;
    private final CuriosityRepository     curiosityRepository;

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

        var promoGrants = promoCreditService.getGrantsForUser(authUser.id()).stream()
            .map(g -> {
                java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("id",               g.getId());
                m.put("campaignId",       g.getCampaignId());
                m.put("label",            g.getLabel());
                m.put("totalCredits",     g.getTotalCredits());
                m.put("usedCredits",      g.getUsedCredits());
                m.put("remainingCredits", g.remainingCredits());
                m.put("expiresOn",        g.getExpiresOn().toString());
                m.put("active",           g.isActive());
                return m;
            }).toList();

        int totalPromoRemaining = promoGrants.stream()
            .filter(g -> Boolean.TRUE.equals(g.get("active")))
            .mapToInt(g -> (int) g.get("remainingCredits"))
            .sum();

        return ResponseEntity.ok(Map.of(
            "used",                used,
            "usedActual",          usedActual,
            "limit",               limit,
            "month",               nowMonth.toString(),
            "promoGrants",         promoGrants,
            "totalPromoRemaining", totalPromoRemaining
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
            "email",                   user.getEmail(),
            "authMethod",              user.getGoogleSub() != null ? "google" : "password",
            "joinedAt",                user.getCreatedAt().toString(),
            "marketingEmailsEnabled",  user.isMarketingEmailsEnabled(),
            "consentGiven",            user.isConsentGiven(),
            "consentVersion",          user.getConsentVersion() != null ? user.getConsentVersion() : "",
            "currentConsentVersion",   currentConsentVersion
        ));
    }

    @Value("${app.consent-version:v1}")
    private String currentConsentVersion;

    @PatchMapping("/me/consent")
    @Transactional
    public ResponseEntity<?> recordConsent(@AuthenticationPrincipal AuthUser authUser) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setConsentGiven(true);
        user.setConsentGivenAt(LocalDateTime.now(java.time.ZoneOffset.UTC));
        user.setConsentVersion(currentConsentVersion);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "consentGiven",   true,
            "consentVersion", currentConsentVersion
        ));
    }

    @PatchMapping("/me/consent/withdraw")
    @Transactional
    public ResponseEntity<?> withdrawConsent(@AuthenticationPrincipal AuthUser authUser) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setConsentGiven(false);
        user.setConsentGivenAt(null);
        user.setConsentVersion(null);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("consentGiven", false));
    }

    @GetMapping("/me/data-summary")
    public ResponseEntity<?> getDataSummary(@AuthenticationPrincipal AuthUser authUser) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        List<Child> children = childRepository.findByOwnerId(authUser.id());

        var childSummaries = children.stream().map(c -> {
            long childId = c.getId();
            return Map.of(
                "name",          (Object) c.getName(),
                "addedOn",       c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate().toString() : "",
                "stories",       storyRepository.countByChildIdAndCreatedAtBetween(childId,
                                     LocalDateTime.of(2000,1,1,0,0), LocalDateTime.now()),
                "journalEntries", journalRepository.countByChildId(childId),
                "drawings",      drawSaveRepository.countByChildId(childId),
                "writings",      writingRepository.countByChildId(childId),
                "curiosityAsks", curiosityRepository.countByChildIdAndCreatedAtBetween(childId,
                                     LocalDateTime.of(2000,1,1,0,0), LocalDateTime.now())
            );
        }).toList();

        return ResponseEntity.ok(Map.of(
            "account", Map.of(
                "email",       user.getEmail(),
                "joinedOn",    user.getCreatedAt().toLocalDate().toString(),
                "authMethod",  user.getGoogleSub() != null ? "Google" : "Email & Password",
                "dataStoredIn","Cloud infrastructure in the United States and other jurisdictions"
            ),
            "consent", Map.of(
                "given",      user.isConsentGiven(),
                "givenOn",    user.getConsentGivenAt() != null ? user.getConsentGivenAt().toLocalDate().toString() : "",
                "version",    user.getConsentVersion() != null ? user.getConsentVersion() : ""
            ),
            "children",    childSummaries,
            "dataCategories", List.of(
                "Account: email address, authentication method, account creation date",
                "Children: name, birth year, avatar, learning preferences",
                "Stories: AI-generated story text and audio (linked to child)",
                "Journal: mood and text entries written by child",
                "Drawings: canvas images saved by child",
                "Writing: text compositions by child with AI feedback",
                "Curiosity Q&A: questions asked and AI answers",
                "Activity events: feature usage timestamps (no personal content)"
            )
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

        resendClient.send(
            user.getEmail(),
            "Your Glumbi password was changed",
            emailTemplates.passwordChanged("by you", user.isAdminOrAbove())
        );

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
        meta.put("draw-animate",      new FeatMeta("Bring to Life","✨"));
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

    @PatchMapping("/me/marketing-emails")
    public ResponseEntity<?> updateMarketingEmails(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestBody Map<String, Boolean> body) {
        AppUser user = userRepository.findById(authUser.id())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Boolean enabled = body.get("enabled");
        if (enabled == null) return ResponseEntity.badRequest().body(Map.of("error", "Missing 'enabled' field"));
        user.setMarketingEmailsEnabled(enabled);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("marketingEmailsEnabled", enabled));
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal AuthUser authUser) {
        if ("SUPER_ADMIN".equals(authUser.role())) {
            long remaining = userRepository.countByRole(AppUser.Role.SUPER_ADMIN);
            if (remaining <= 1)
                return ResponseEntity.status(400).body(Map.of("error",
                    "You are the only super admin. Promote another admin first before deleting your account."));
        }
        AppUser deleting = userRepository.findById(authUser.id())
            .filter(u -> !u.isAdminOrAbove()).orElse(null);
        String email = deleting != null ? deleting.getEmail() : null;
        accountDeletionService.deleteUser(authUser.id());
        if (email != null) {
            resendClient.send(email, "Your Glumbi account has been deleted", emailTemplates.accountDeletedBySelf());
            adminAlertService.notifyUserDeleted(email, "self");
        }
        return ResponseEntity.noContent().build();
    }
}
