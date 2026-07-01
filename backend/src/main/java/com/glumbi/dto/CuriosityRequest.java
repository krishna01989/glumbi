package com.glumbi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CuriosityRequest {
    @NotNull
    private Long childId;

    @NotBlank
    @Size(max = 200, message = "Question must be 200 characters or fewer")
    private String question;
}
