package com.glumbi.service;

import com.glumbi.entity.AiUsageLog;
import com.glumbi.entity.AppSetting;
import com.glumbi.entity.AppUser;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.entity.UserFeatureOverride;
import com.glumbi.repository.AiUsageLogRepository;
import com.glumbi.repository.AppSettingRepository;
import com.glumbi.repository.FeatureConfigRepository;
import com.glumbi.repository.UserFeatureOverrideRepository;
import com.glumbi.repository.UserRepository;
import com.glumbi.entity.SchedulerRun;
import com.glumbi.repository.SchedulerRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class ApiQuotaService {

    private static final String SETTING_KEY          = "default-monthly-credits";
    public  static final String RESET_HISTORY_KEY    = "scheduler.reset-credits.history";
    
    private final UserRepository                userRepository;
    private final NotificationService           notificationService;
    private final FeatureConfigRepository       featureConfigRepo;
    private final AppSettingRepository          appSettingRepo;
    private final UserFeatureOverrideRepository overrideRepo;
    private final SchedulerRunRepository        schedulerRunRepo;
    private final AiUsageLogRepository          usageLogRepo;

    @Value("${app.quota.default-monthly-credits:200}")
    private int defaultMonthlyCreditsYaml;

    /**
     * Deduct the credit cost of a feature and log usage against a specific child.
     */
    @Transactional
    public boolean tryConsume(Long userId, String feature, Long childId) {
        int cost = featureConfigRepo.findById(feature)
            .map(fc -> fc.getCreditCost())
            .orElse(1);
        boolean ok = consumeCredits(userId, cost);
        if (ok) {
            AiUsageLog log = new AiUsageLog();
            log.setUserId(userId);
            log.setChildId(childId);
            log.setFeatureName(feature);
            log.setCreditsUsed(cost);
            usageLogRepo.save(log);
        }
        return ok;
    }

    /** Overload without childId — logs with null child (feature not child-specific). */
    @Transactional
    public boolean tryConsume(Long userId, String feature) {
        return tryConsume(userId, feature, null);
    }

    /** Fallback for call sites that don't yet specify a feature (costs 1 credit). */
    @Transactional
    public boolean tryConsume(Long userId) {
        return tryConsume(userId, "unknown", null);
    }

    private boolean consumeCredits(Long userId, int cost) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Admins and super-admins are exempt from quota — unlimited AI access
        if (user.isAdminOrAbove()) return true;

        String thisMonth = YearMonth.now().toString();

        if (!thisMonth.equals(user.getApiCallMonth())) {
            user.setApiCallMonth(thisMonth);
            user.setMonthlyApiCalls(0);
            user.setQuotaWarnMonth(null);
        }

        int limit = user.getQuotaLimit() > 0 ? user.getQuotaLimit() : getDefaultMonthlyCredits();
        if (user.getMonthlyApiCalls() + cost > limit) {
            return false;
        }

        user.setMonthlyApiCalls(user.getMonthlyApiCalls() + cost);
        userRepository.save(user);

        int used = user.getMonthlyApiCalls();
        boolean crossed80      = used >= (int) Math.ceil(limit * 0.8);
        boolean warnNotSentYet = !thisMonth.equals(user.getQuotaWarnMonth());
        if (crossed80 && warnNotSentYet) {
            user.setQuotaWarnMonth(thisMonth);
            userRepository.save(user);
            notificationService.save(
                user, null, NotificationType.QUOTA_WARNING,
                String.format(
                    "⚠️ You've used %d of your %d AI credits this month (%.0f%%). " +
                    "Consider switching to Practice Mode to keep learning without using credits.",
                    used, limit, (used * 100.0) / limit
                )
            );
        }

        return true;
    }

    /** Safety net: reset all counters on the 1st of each month at midnight. */
    @Scheduled(cron = "0 0 0 1 * *")
    @Transactional
    public void resetAllMonthlyCounters() {
        // Insert RUNNING row immediately
        SchedulerRun run = new SchedulerRun();
        run.setSchedulerId("reset-credits");
        run.setStartedAt(LocalDateTime.now());
        run.setStatus("RUNNING");
        run = schedulerRunRepo.save(run);

        String error = null;
        int usersReset = 0;
        try {
            String thisMonth = YearMonth.now().toString();
            for (var user : userRepository.findAll()) {
                if (user.isAdminOrAbove()) continue;
                user.setMonthlyApiCalls(0);
                user.setApiCallMonth(thisMonth);
                user.setQuotaWarnMonth(null);
                userRepository.save(user);
                usersReset++;
            }
        } catch (Exception e) {
            error = e.getMessage();
            System.err.println("[Scheduler] Credit reset failed: " + error);
        }

        // Update row with result
        run.setFinishedAt(LocalDateTime.now());
        run.setStatus(error == null ? "SUCCESS" : "FAILED");
        run.setChildrenProcessed(usersReset);
        run.setErrors(error != null ? "[\"" + error + "\"]" : "[]");
        schedulerRunRepo.save(run);
    }

    public int getDefaultMonthlyCredits() {
        return appSettingRepo.findById(SETTING_KEY)
            .map(s -> { try { return Integer.parseInt(s.getValue()); } catch (NumberFormatException e) { return defaultMonthlyCreditsYaml; } })
            .orElse(defaultMonthlyCreditsYaml);
    }

    /**
     * Returns true if the feature is enabled for the given user.
     * Check order: global toggle first, then per-user override.
     * If globally disabled, user override cannot re-enable it.
     */
    public boolean isFeatureEnabled(Long userId, String featureName) {
        boolean globallyEnabled = featureConfigRepo.findById(featureName)
            .map(fc -> fc.isEnabled())
            .orElse(true);
        if (!globallyEnabled) return false;

        return overrideRepo.findById(new UserFeatureOverride.Id(userId, featureName))
            .map(UserFeatureOverride::isEnabled)
            .orElse(true);
    }

    @Transactional
    public void setUserFeatureOverride(Long userId, String featureName, boolean enabled) {
        UserFeatureOverride override = overrideRepo
            .findById(new UserFeatureOverride.Id(userId, featureName))
            .orElseGet(() -> {
                UserFeatureOverride o = new UserFeatureOverride();
                o.setId(new UserFeatureOverride.Id(userId, featureName));
                return o;
            });
        override.setEnabled(enabled);
        overrideRepo.save(override);
    }

    @Transactional
    public void removeUserFeatureOverride(Long userId, String featureName) {
        overrideRepo.deleteById(new UserFeatureOverride.Id(userId, featureName));
    }

    @Transactional
    public void setDefaultMonthlyCredits(int credits) {
        AppSetting setting = appSettingRepo.findById(SETTING_KEY).orElseGet(() -> {
            AppSetting s = new AppSetting(); s.setKey(SETTING_KEY); return s;
        });
        setting.setValue(String.valueOf(credits));
        appSettingRepo.save(setting);
    }
}
