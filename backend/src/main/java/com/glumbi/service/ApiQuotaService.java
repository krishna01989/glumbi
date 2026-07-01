package com.glumbi.service;

import com.glumbi.entity.AppUser;
import com.glumbi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class ApiQuotaService {

    private static final int MONTHLY_LIMIT = 200; // calls per user per month

    private final UserRepository userRepository;

    /**
     * Returns true if the user is within quota and increments their counter.
     * Returns false if they've hit the monthly limit.
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
        }

        if (user.getMonthlyApiCalls() >= MONTHLY_LIMIT) {
            return false;
        }

        user.setMonthlyApiCalls(user.getMonthlyApiCalls() + 1);
        userRepository.save(user);
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
            userRepository.save(user);
        });
    }
}
