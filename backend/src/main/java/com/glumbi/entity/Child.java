package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "children")
@Data
@NoArgsConstructor
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash", "children"})
    private AppUser owner;

    @Column(nullable = false)
    private String name;

    private Integer birthYear;

    private String avatarEmoji;

    private String gender; // "boy", "girl"

    private String theme = "coral"; // coral, ocean, forest, candy, galaxy, sunshine

    @Column(columnDefinition = "TEXT")
    private String enabledFeatures; // JSON array e.g. ["stories","activities","curiosity"]

    private Integer screenTimeLimitMinutes = 45; // 0 = no limit
    private Integer maxSnoozeCount = 2; // 0 = unlimited

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
