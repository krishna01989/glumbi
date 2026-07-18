package com.glumbi.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "flipbook_saves")
@Data
@NoArgsConstructor
public class FlipbookSave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Child child;

    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String framesJson;

    private int frameCount;

    private int fps = 8;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);

    private LocalDateTime updatedAt = LocalDateTime.now(ZoneOffset.UTC);
}
