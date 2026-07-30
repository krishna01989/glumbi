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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class ApiQuotaService {

    private static final String SETTING_KEY          = "default-monthly-credits";
    
    private final UserRepository                userRepository;
    private final NotificationService           notificationService;
    private final FeatureConfigRepository       featureConfigRepo;
    private final AppSettingRepository          appSettingRepo;
    private final UserFeatureOverrideRepository overrideRepo;
    private final AiUsageLogRepository          usageLogRepo;
    private final ResendClient                  resendClient;
    private final EmailTemplates                emailTemplates;
    private final PromoCreditService            promoCreditService;

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
        String source = consumeCredits(userId, cost);
        if (source != null) {
            AiUsageLog log = new AiUsageLog();
            log.setUserId(userId);
            log.setChildId(childId);
            log.setFeatureName(feature);
            log.setCreditsUsed(cost);
            log.setCreditSource(source);
            usageLogRepo.save(log);
        }
        return source != null;
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

    /** Returns the credit source string if deducted, null if all quota exhausted. */
    private String consumeCredits(Long userId, int cost) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Admins and super-admins are exempt from quota — unlimited AI access
        if (user.isAdminOrAbove()) return "MONTHLY";

        // Parental consent is required before any AI credit is spent
        if (!user.isConsentGiven()) return null;

        String thisMonth = YearMonth.now().toString();

        // Roll counter forward if the month has changed — safe to do outside the atomic update
        // because only this transaction resets the month, and it's idempotent
        if (!thisMonth.equals(user.getApiCallMonth())) {
            user.setApiCallMonth(thisMonth);
            user.setMonthlyApiCalls(0);
            user.setQuotaWarnMonth(null);
            user.setQuotaExhaustedMonth(null);
            userRepository.save(user);
        }

        int limit = user.getQuotaLimit() > 0 ? user.getQuotaLimit() : getDefaultMonthlyCredits();

        // Atomic check-and-increment — eliminates TOCTOU race between concurrent requests
        int updated = userRepository.atomicDeductCredits(userId, cost, thisMonth, limit);
        if (updated == 0) {
            // Monthly quota exhausted — try promo reserve (EEF order)
            String drawnFrom = promoCreditService.tryDrawPromo(userId, cost);
            if (drawnFrom != null) return "PROMO:" + drawnFrom;
            return null;
        }

        // Re-fetch to get the post-update value for notification thresholds
        user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int used = user.getMonthlyApiCalls();

        int usedPercent = (int) Math.round((used * 100.0) / limit);

        boolean crossed80      = usedPercent >= 80;
        boolean warnNotSentYet = !thisMonth.equals(user.getQuotaWarnMonth());
        if (crossed80 && warnNotSentYet) {
            user.setQuotaWarnMonth(thisMonth);
            userRepository.save(user);
            notificationService.save(
                user, null, NotificationType.QUOTA_WARNING,
                "⚠️ You've used over 80% of your monthly AI credits. " +
                "Consider switching to Practice Mode to keep learning without using credits."
            );
            resendClient.send(user.getEmail(), "You've used " + usedPercent + "% of your Glumbi credits ⚠️",
                emailTemplates.quotaWarning(usedPercent));
        }

        boolean crossed100          = used >= limit;
        boolean exhaustedNotSentYet = !thisMonth.equals(user.getQuotaExhaustedMonth());
        if (crossed100 && exhaustedNotSentYet) {
            user.setQuotaExhaustedMonth(thisMonth);
            userRepository.save(user);
            // Check if promo credits exist — tailor the message accordingly
            boolean hasPromo = !promoCreditService.getGrantsForUser(userId).stream()
                .filter(com.glumbi.entity.PromoCreditGrant::isActive).toList().isEmpty();
            String msg = hasPromo
                ? "🚫 Monthly credits used up — your bonus credits are now active! Keep learning."
                : "🚫 You've used all your monthly AI credits. AI features are paused until next month. " +
                  "Switch to Practice Mode to keep learning without credits.";
            notificationService.save(user, null, NotificationType.QUOTA_WARNING, msg);
            resendClient.send(user.getEmail(), "You've used all your Glumbi credits for this month 🚫",
                emailTemplates.quotaWarning(100));
        }

        return "MONTHLY";
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
