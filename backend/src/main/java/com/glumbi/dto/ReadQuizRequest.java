package com.glumbi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReadQuizRequest {
    @NotNull  private Long childId;
    @NotBlank private String topic;
}
