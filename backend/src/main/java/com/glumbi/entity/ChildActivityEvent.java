package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "child_activity_events", indexes = {
    @Index(name = "idx_cae_child_time",  columnList = "child_id, occurred_at"),
    @Index(name = "idx_cae_user_time",   columnList = "user_id, occurred_at"),
    @Index(name = "idx_cae_feature",     columnList = "feature, occurred_at"),
    @Index(name = "idx_cae_client_key",  columnList = "client_key", unique = true),
    @Index(name = "idx_cae_child_feature_type", columnList = "child_id, feature, event_type"),
})
@Data
@NoArgsConstructor
public class ChildActivityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Plain Long columns — no FK constraint so rows survive child/user deletion
    @Column(name = "child_id")     private Long    childId;   // null after account deletion (anonymised)
    @Column(name = "user_id")      private Long    userId;    // null after account deletion (anonymised)

    // Denormalised so records stay readable after account deletion
    @Column(name = "child_name",   length = 100)  private String childName;   // null after anonymisation
    @Column(name = "parent_email", length = 255)  private String parentEmail; // null after anonymisation

    @Column(nullable = false, length = 64)  private String feature;
    @Column(nullable = false, length = 64)  private String eventType;
    @Column(nullable = false)               private boolean online;

    @Column(name = "duration_seconds")      private Integer durationSeconds;
    @Column(columnDefinition = "TEXT")      private String  metadata;

    @Column(name = "occurred_at", nullable = false) private LocalDateTime occurredAt;
    @Column(name = "synced_at",   nullable = false) private LocalDateTime syncedAt = LocalDateTime.now(ZoneOffset.UTC);

    // Client-generated UUID; unique index prevents duplicate syncs on retry
    @Column(name = "client_key", unique = true, length = 64) private String clientKey;
}
