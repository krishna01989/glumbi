package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "curiosity_entries")
@Data
@NoArgsConstructor
public class CuriosityEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Child child;

    @Column(nullable = false)
    private String question;      // "Why is the sky blue?"

    @Column(columnDefinition = "TEXT")
    private String funFact1;

    @Column(columnDefinition = "TEXT")
    private String funFact2;

    @Column(columnDefinition = "TEXT")
    private String funFact3;

    private String quizQuestion;

    private String quizAnswer;    // correct answer

    private String quizOption1;
    private String quizOption2;
    private String quizOption3;

    private String sticker;       // emoji sticker awarded

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
