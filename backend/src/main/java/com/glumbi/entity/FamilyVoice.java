package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "family_voices")
@Data
@NoArgsConstructor
public class FamilyVoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, length = 50)
    private String name; // e.g. "Mom", "Dad", "Granny"

    @Column(nullable = false)
    private String elevenLabsVoiceId;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneOffset.UTC);
}
