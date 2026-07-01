package com.glumbi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WritingRequest {
    @NotNull  private Long childId;
    @NotBlank private String title;
    @NotBlank private String content;
}
