package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private LocalDateTime createdAt = LocalDateTime.now();

    // Monthly API usage tracking
    private int monthlyApiCalls = 0;
    private String apiCallMonth;   // "YYYY-MM" — resets when month changes
    @Column(columnDefinition = "integer default 200")
    private int quotaLimit = 200;  // per-user limit, admin-configurable
    @Column(columnDefinition = "varchar(7)")
    private String quotaWarnMonth; // "YYYY-MM" — tracks when 80% warning was last sent

    @Column(nullable = true, columnDefinition = "boolean default false")
    private boolean onHold = false;

    @Column(columnDefinition = "TEXT")
    private String holdReason;

    public enum Role { USER, ADMIN }
}
