package com.glumbi.service;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.entity.PromoCampaign;
import com.glumbi.entity.PromoCreditGrant;
import com.glumbi.repository.PromoCreditGrantRepository;
import com.glumbi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromoCreditService {

    private final PromoCreditGrantRepository grantRepo;
    private final UserRepository             userRepo;
    private final NotificationService        notificationService;
    private final ResendClient               resendClient;
    private final EmailTemplates             emailTemplates;

    /**
     * Try to draw `cost` credits from the user's active promo grants using EEF order.
     * Returns the campaignId that was drawn from, or null if no active grant could cover the cost.
     */
    @Transactional
    public String tryDrawPromo(Long userId, int cost) {
        List<PromoCreditGrant> active = grantRepo.findActiveForUser(userId, LocalDate.now());
        for (PromoCreditGrant grant : active) {
            int rows = grantRepo.atomicDraw(grant.getId(), cost, LocalDate.now());
            if (rows > 0) {
                // Re-fetch to check if this grant just became exhausted
                grantRepo.findById(grant.getId()).ifPresent(g -> {
                    if (g.getUsedCredits() >= g.getTotalCredits()) {
                        notifyPromoExhausted(userId, g);
                    }
                });
                return grant.getCampaignId();
            }
            // rows == 0 → this grant ran dry in a race; fall through to next
        }
        return null;
    }

    /**
     * Grant promo credits to a single user. Idempotent — skips if campaign already granted to user.
     * Returns true if a new grant was created, false if already existed.
     */
    @Transactional
    public boolean grantToUser(Long userId, PromoCampaign campaign, String grantedBy) {
        if (grantRepo.existsByUserIdAndCampaignCampaignId(userId, campaign.getCampaignId())) return false;

        AppUser user = userRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        PromoCreditGrant grant = new PromoCreditGrant();
        grant.setUser(user);
        grant.setCampaign(campaign);
        grant.setLabel(campaign.getLabel());
        grant.setTotalCredits(campaign.getCreditsPerUser());
        grant.setExpiresOn(campaign.getExpiresOn());
        grant.setGrantedBy(grantedBy);
        grantRepo.save(grant);

        LocalDate expiresOn = campaign.getExpiresOn();
        int credits = campaign.getCreditsPerUser();
        String label = campaign.getLabel();
        String expiresFormatted = expiresOn.format(DateTimeFormatter.ofPattern("d MMM, yyyy", Locale.ENGLISH));

        // In-app notification
        notificationService.save(user, null, NotificationType.PROMO_GRANT,
            "🎁 You've received " + credits + " bonus credits: " + label + " — " +
            "expires " + expiresFormatted + ". They kick in automatically when your monthly credits run out.");

        // Email
        try {
            resendClient.send(user.getEmail(),
                "🎁 You've got " + credits + " bonus Glumbi credits!",
                emailTemplates.promoGrant(label, credits, expiresFormatted));
        } catch (Exception e) {
            log.warn("Promo grant email failed for user {}: {}", userId, e.getMessage());
        }

        return true;
    }

    /**
     * Batch-grant to all eligible users from a PromoCampaign.
     * Runs synchronously — call from an async context or scheduler.
     */
    @Transactional
    public int grantToAllUsers(PromoCampaign campaign) {
        List<AppUser> users = userRepo.findByRole(AppUser.Role.USER).stream()
            .filter(u -> !u.isOnHold())
            .toList();

        int created = 0;
        for (AppUser user : users) {
            boolean isNew = grantToUser(user.getId(), campaign, "campaign");
            if (isNew) created++;
        }
        log.info("Promo campaign '{}' granted to {}/{} users", campaign.getCampaignId(), created, users.size());
        return created;
    }

    /** All grants for a user — used by user-facing and admin APIs. */
    public List<PromoCreditGrant> getGrantsForUser(Long userId) {
        return grantRepo.findAllForUser(userId);
    }

    /** Admin: all grants for a specific campaign. */
    public List<PromoCreditGrant> getGrantsForCampaign(String campaignId) {
        return grantRepo.findByCampaignId(campaignId);
    }

    /** Admin: campaign-level summaries. */
    public List<Object[]> getCampaignSummaries() {
        return grantRepo.findCampaignSummaries();
    }

    private void notifyPromoExhausted(Long userId, PromoCreditGrant grant) {
        userRepo.findById(userId).ifPresent(user -> {
            String nextReset = YearMonth.now().plusMonths(1).atDay(1).toString();
            notificationService.save(user, null, NotificationType.QUOTA_WARNING,
                "Your " + grant.getLabel() + " bonus credits are fully used. " +
                "Monthly credits reset on " + nextReset + ".");
            try {
                resendClient.send(user.getEmail(),
                    "Your Glumbi bonus credits are used up",
                    emailTemplates.promoExhausted(grant.getLabel(), nextReset));
            } catch (Exception e) {
                log.warn("Promo exhausted email failed for user {}: {}", userId, e.getMessage());
            }
        });
    }
}
