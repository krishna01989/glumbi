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

    // JSON map of "{language}:{cacheKeySuffix}" → {title, content} — avoids re-translating on cache miss
    @Column(columnDefinition = "TEXT")
    private String translationsJson;

    // Glumbi guide fields — generated alongside the story in one Claude call
    @Column(columnDefinition = "TEXT")
    private String storyPart1;        // first half of story, ends at natural cliffhanger

    @Column(columnDefinition = "TEXT")
    private String storyPart2;        // fallback second half (old stories without branching)

    @Column(columnDefinition = "TEXT")
    private String storyPart2A;       // branch A: second half if child picked choice 0

    @Column(columnDefinition = "TEXT")
    private String storyPart2B;       // branch B: second half if child picked choice 1

    @Column(columnDefinition = "TEXT")
    private String glumbiIntro;       // guide line shown before TTS starts

    @Column(columnDefinition = "TEXT")
    private String glumbiMidQuestion; // prediction question shown after part1

    @Column(columnDefinition = "TEXT")
    private String glumbiMidChoices;  // JSON array of 2 choice strings

    @Column(columnDefinition = "TEXT")
    private String glumbiPostQuestion; // question shown after story ends

    @Column(columnDefinition = "TEXT")
    private String glumbiEpilogue;    // short "what happened next" generated upfront

    @Column(columnDefinition = "TEXT")
    private String vocabWordsJson;    // JSON array of {word, definition, emoji}

    @Column(columnDefinition = "TEXT")
    private String runnerLevelJson;   // JSON object for Story Chase runner level

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);
}
