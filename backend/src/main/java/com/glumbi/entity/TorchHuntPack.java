package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "torch_hunt_packs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "theme_key", "age_group"}))
@Data
@NoArgsConstructor
public class TorchHuntPack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Per-parent (not per-child) — siblings share a pack, cross-family packs are independent
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "theme_key", nullable = false, length = 80)
    private String themeKey;

    @Column(name = "age_group", nullable = false, length = 20)
    private String ageGroup;

    // JSON array of 50 TorchObject items
    @Column(nullable = false, columnDefinition = "TEXT")
    private String objectsJson;

    // JSON array of 4 scene narratives (strings)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String narrativesJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);
}
