package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Child child;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private NotificationType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private boolean read = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);

    public enum NotificationType {
        PROGRESS_REPORT,
        MILESTONE,
        STORY_RECOMMENDATION,
        LEARNING_INSIGHT,
        LEARN_TO_WRITE,
        MEMORY_PLAY,
        CURIOSITY_INSIGHT,
        JOURNAL_INSIGHT,
        QUOTA_WARNING,
        PROMO_GRANT,
        ADMIN_ALERT
    }
}
