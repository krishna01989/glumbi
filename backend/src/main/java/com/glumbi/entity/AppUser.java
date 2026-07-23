package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "app_users")
@Data
@NoArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String passwordHash; // null for Google-federated accounts

    private String googleSub;   // Google subject ID for federated accounts

    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);

    // Monthly API usage tracking
    private int monthlyApiCalls = 0;
    private String apiCallMonth;   // "YYYY-MM" — resets when month changes
    @Column(columnDefinition = "integer default 0")
    private int quotaLimit = 0;  // 0 = use global default from app.quota.default-monthly-credits
    @Column(columnDefinition = "varchar(7)")
    private String quotaWarnMonth;      // "YYYY-MM" — tracks when 80% warning was last sent
    @Column(columnDefinition = "varchar(7)")
    private String quotaExhaustedMonth; // "YYYY-MM" — tracks when 100% exhausted notification was last sent
    @Column(columnDefinition = "varchar(7)")
    private String lastResetMonth;      // "YYYY-MM" — set only by scheduler/admin reset, guards idempotency

    @Column(nullable = true, columnDefinition = "boolean default false")
    private boolean onHold = false;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean marketingEmailsEnabled = true;

    @Column(columnDefinition = "TEXT")
    private String holdReason;

    public enum Role { USER, ADMIN, SUPER_ADMIN }

    public boolean isSuperAdmin() { return role == Role.SUPER_ADMIN; }
    public boolean isAdminOrAbove() { return role == Role.ADMIN || role == Role.SUPER_ADMIN; }
}
