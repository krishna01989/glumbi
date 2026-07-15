package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "writing_entries")
@Data
@NoArgsConstructor
public class WritingEntry {

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

    // Series / lineage — null for standalone stories
    private Long parentStoryId;   // immediate parent chapter (for feedback tip)
    private Long seriesId;        // root story id (for grouping all chapters)

    // AI feedback fields — null until feedback is requested
    private String feedbackPraise;
    private String feedbackSuggestion;
    private String feedbackEncouragement;
    private String starWord;
    private String badge;
    private boolean feedbackReceived = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);
    private LocalDateTime updatedAt = LocalDateTime.now(ZoneOffset.UTC);
}
