package com.glumbi.service;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class ApiQuotaService {

    private final UserRepository       userRepository;
    private final NotificationService  notificationService;

    /**
     * Returns true if the user is within quota and increments their counter.
     * Returns false if they've hit the monthly limit.
     * Fires a one-time QUOTA_WARNING notification when the user crosses 80%.
     */
    @Transactional
    public boolean tryConsume(Long userId) {
        AppUser user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String thisMonth = YearMonth.now().toString(); // "YYYY-MM"

        // Reset counter if it's a new month
        if (!thisMonth.equals(user.getApiCallMonth())) {
            user.setApiCallMonth(thisMonth);
            user.setMonthlyApiCalls(0);
            user.setQuotaWarnMonth(null); // reset warning flag for new month
        }

        int limit = user.getQuotaLimit() > 0 ? user.getQuotaLimit() : 200;
        if (user.getMonthlyApiCalls() >= limit) {
            return false;
        }

        user.setMonthlyApiCalls(user.getMonthlyApiCalls() + 1);
        userRepository.save(user);

        // Send 80% warning once per month
        int used = user.getMonthlyApiCalls();
        boolean crossed80 = used >= (int) Math.ceil(limit * 0.8);
        boolean warnNotSentYet = !thisMonth.equals(user.getQuotaWarnMonth());
        if (crossed80 && warnNotSentYet) {
            user.setQuotaWarnMonth(thisMonth);
            userRepository.save(user);
            notificationService.save(
                user, null, NotificationType.QUOTA_WARNING,
                String.format(
                    "⚠️ You've used %d of your %d AI calls this month (%.0f%%). " +
                    "Consider switching to Practice Mode to keep learning without using quota.",
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
        String thisMonth = YearMonth.now().toString();
        userRepository.findAll().forEach(user -> {
            user.setMonthlyApiCalls(0);
            user.setApiCallMonth(thisMonth);
            user.setQuotaWarnMonth(null);
            userRepository.save(user);
        });
    }
}
