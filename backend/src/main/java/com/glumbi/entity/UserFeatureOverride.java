package com.glumbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "user_feature_overrides")
@Data
@NoArgsConstructor
public class UserFeatureOverride {

    @EmbeddedId
    private Id id;

    @Column(nullable = false)
    private boolean enabled;

    @Embeddable
    @Data
    @NoArgsConstructor
    public static class Id implements Serializable {
        private Long userId;
        @Column(length = 50)
        private String featureName;

        public Id(Long userId, String featureName) {
            this.userId = userId;
            this.featureName = featureName;
        }
    }
}
