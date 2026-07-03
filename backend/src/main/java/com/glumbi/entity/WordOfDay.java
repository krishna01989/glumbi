package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "word_of_day")
@Data
@NoArgsConstructor
public class WordOfDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Child child;

    @Column(nullable = false)
    private String word;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    private String pronunciation;

    private String emoji;

    @Column(nullable = false)
    private LocalDate date;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
