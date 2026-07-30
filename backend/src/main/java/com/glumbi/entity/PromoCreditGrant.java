package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(
    name = "promo_credit_grants",
    indexes = {
        @Index(name = "idx_promo_user",     columnList = "user_id"),
        @Index(name = "idx_promo_campaign", columnList = "campaign_id"),
        @Index(name = "idx_promo_expires",  columnList = "expires_on"),
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_promo_user_campaign", columnNames = {"user_id", "campaign_id"})
    }
)
@Data
@NoArgsConstructor
public class PromoCreditGrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", referencedColumnName = "campaign_id", nullable = false)
    private PromoCampaign campaign;

    /** User-visible label — denormalized from campaign at grant time for EEF query self-containment. */
    @Column(nullable = false, length = 200)
    private String label;

    @Column(nullable = false)
    private int totalCredits;

    @Column(nullable = false)
    private int usedCredits = 0;

    @Column(nullable = false)
    private LocalDate expiresOn;

    @Column(nullable = false, updatable = false)
    private LocalDateTime grantedAt = LocalDateTime.now(ZoneOffset.UTC);

    /** Who triggered this grant: "campaign" or "manual-support" */
    @Column(nullable = false, length = 50)
    private String grantedBy = "campaign";

    /** Convenience accessor — delegates to the campaign FK. */
    public String getCampaignId() {
        return campaign.getCampaignId();
    }

    public int remainingCredits() {
        return Math.max(0, totalCredits - usedCredits);
    }

    public boolean isActive() {
        return !LocalDate.now().isAfter(expiresOn) && usedCredits < totalCredits;
    }
}
