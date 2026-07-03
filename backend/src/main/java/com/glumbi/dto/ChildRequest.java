package com.glumbi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChildRequest {
    @NotBlank
    private String name;

    private Integer birthYear;

    private String avatarEmoji = "🧒";

    private String gender;

    private String theme = "coral";

    private String enabledFeatures; // JSON array string

    private Integer screenTimeLimitMinutes = 45;
    private Integer maxSnoozeCount = 2;
}
