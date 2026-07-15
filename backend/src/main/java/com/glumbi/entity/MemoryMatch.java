package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "memory_matches")
@Data
@NoArgsConstructor
public class MemoryMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Child child;

    @Column(nullable = false)
    private String theme;

    @Column(columnDefinition = "TEXT")
    private String pairs; // JSON array of {emoji, label}

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);
}
