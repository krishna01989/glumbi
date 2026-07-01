package com.glumbi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JournalRequest {
    @NotNull
    private Long childId;

    @NotBlank
    @Size(max = 500, message = "Journal entry must be 500 characters or fewer")
    private String content;

    @Size(max = 50, message = "Mood must be 50 characters or fewer")
    private String mood;

    @Size(max = 200, message = "Milestone must be 200 characters or fewer")
    private String milestone;
}
