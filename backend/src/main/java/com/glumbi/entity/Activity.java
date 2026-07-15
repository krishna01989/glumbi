package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Child child;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;      // indoor / outdoor / creative / learning

    private String duration;      // "10-15 mins"

    private String emoji;

    private Boolean completed = false;

    private Integer rating;       // 1-5 stars, set by parent after activity

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);
}
