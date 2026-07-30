package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(
    name = "promo_campaigns",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_promo_campaign_id", columnNames = {"campaign_id"})
    }
)
@Data
@NoArgsConstructor
public class PromoCampaign {

    public enum Status { DRAFT, ACTIVE, MANUAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique slug — no spaces, used for dedup. e.g. "anniversary-2026-07" */
    @Column(name = "campaign_id", nullable = false, length = 100)
    private String campaignId;

    /** User-visible name. e.g. "🎂 1-Year Anniversary Gift" */
    @Column(nullable = false, length = 200)
    private String label;

    @Column(nullable = false)
    private int creditsPerUser;

    @Column(nullable = false)
    private LocalDate expiresOn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.DRAFT;

    /** Admin email who created this campaign */
    @Column(nullable = false, length = 200)
    private String createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);

    /** Set when campaign is activated */
    private LocalDateTime activatedAt;
}
