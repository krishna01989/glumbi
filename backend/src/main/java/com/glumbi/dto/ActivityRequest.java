package com.glumbi.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActivityRequest {
    @NotNull
    private Long childId;

    private String timeOfDay;   // morning / afternoon / evening
    private String weather;     // sunny / rainy / cloudy — frontend detects & sends
    private int count = 3;      // 1 for substitution, 3 for full set
}
