package com.glumbi.controller;

import com.glumbi.repository.FeatureConfigRepository;
import com.glumbi.service.ApiQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final FeatureConfigRepository featureConfigRepo;
    private final ApiQuotaService quotaService;

    @GetMapping("/feature-credits")
    public ResponseEntity<?> featureCredits() {
        var list = featureConfigRepo.findAll().stream()
            .map(fc -> Map.of(
                "featureName", (Object) fc.getFeatureName(),
                "creditCost",  (Object) fc.getCreditCost()
            ))
            .toList();
        return ResponseEntity.ok(Map.of(
            "defaultCredits", quotaService.getDefaultMonthlyCredits(),
            "features", list
        ));
    }
}
