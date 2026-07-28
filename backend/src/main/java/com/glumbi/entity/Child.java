package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

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

    @JsonIgnore
    @Column(name = "pin_hash")
    private String pinHash;

    @Column(name = "graduated", nullable = false, columnDefinition = "boolean default false")
    private boolean graduated = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);

    public boolean isHasPinSet() {
        return pinHash != null;
    }
}
