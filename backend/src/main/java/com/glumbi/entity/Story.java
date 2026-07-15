package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "stories")
@Data
@NoArgsConstructor
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Child child;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String keywords;    // comma-separated: "dragon, brave girl, forest"

    private String category;    // e.g. "adventure", "bedtime", "funny"

    private boolean favorite = false;

    // Series / lineage — null for standalone stories
    private Long parentStoryId;
    private Long seriesId;

    // JSON map of cacheKey → R2 public URL, persisted so audio survives restarts/deploys
    @Column(columnDefinition = "TEXT")
    private String audioUrls;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);
}
