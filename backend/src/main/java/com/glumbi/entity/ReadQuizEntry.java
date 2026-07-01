package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "read_quiz_entries")
@Data
@NoArgsConstructor
public class ReadQuizEntry {

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
    private String story;

    private String topic;
    private String readingTime;
    private String lesson;

    // JSON-stored questions and answers
    @Column(columnDefinition = "TEXT")
    private String questionsJson;   // serialised Question[]

    @Column(columnDefinition = "TEXT")
    private String answersJson;     // int[] of child's chosen option indices — null until submitted

    private Integer score;          // 0-3, null until submitted
    private boolean completed = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
