package com.glumbi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ChildRequest {
    @NotBlank
    private String name;

    @NotNull
    private LocalDate birthDate;

    private String avatarEmoji = "🧒";

    private String gender;

    private String theme = "coral";

    private String enabledFeatures; // JSON array string
}
