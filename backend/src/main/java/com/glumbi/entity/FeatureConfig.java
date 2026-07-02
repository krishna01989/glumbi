package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "feature_config")
@Data
@NoArgsConstructor
public class FeatureConfig {

    @Id
    @Column(length = 50)
    private String featureName;  // e.g. "story", "draw", "read-quiz"

    @Column(nullable = false)
    private int creditCost = 1;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;

    @Column(length = 200)
    private String description;
}
