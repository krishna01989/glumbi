package com.glumbi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StoryRequest {
    @NotNull
    private Long childId;

    @NotBlank
    @Size(max = 120, message = "Story keywords must be 120 characters or fewer")
    private String keywords;

    private Long previousStoryId; // optional — when set, generates a continuation

    private String category; // optional — e.g. "adventure", "bedtime", "funny"; defaults to "adventure"
}
