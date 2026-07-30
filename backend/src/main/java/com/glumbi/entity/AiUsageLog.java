package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "ai_usage_log", indexes = {
    @Index(name = "idx_usage_user_month", columnList = "user_id, used_at"),
    @Index(name = "idx_usage_child",      columnList = "child_id, used_at"),
})
@Data
@NoArgsConstructor
public class AiUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "child_id")
    private Long childId;   // null for features not tied to a specific child

    @Column(nullable = false, length = 64)
    private String featureName;

    @Column(nullable = false)
    private int creditsUsed;

    /** "MONTHLY" or "PROMO:anniversary-2026-07" */
    @Column(length = 120)
    private String creditSource = "MONTHLY";

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt = LocalDateTime.now(ZoneOffset.UTC);
}
