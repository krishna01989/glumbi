package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "scheduler_runs")
@Data
@NoArgsConstructor
public class SchedulerRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String schedulerId;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    @Column(nullable = false)
    private String status; // RUNNING | SUCCESS | FAILED

    private Integer childrenProcessed;

    @Column(columnDefinition = "TEXT")
    private String agentsRan;      // JSON array string

    @Column(columnDefinition = "TEXT")
    private String agentsSkipped;  // JSON array string

    @Column(columnDefinition = "TEXT")
    private String errors;         // JSON array string
}
