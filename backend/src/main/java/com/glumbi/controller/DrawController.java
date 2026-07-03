package com.glumbi.controller;

import com.glumbi.agent.DrawAgent;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ApiQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/draw")
@RequiredArgsConstructor
public class DrawController {

    private final DrawAgent       drawAgent;
    private final ApiQuotaService quotaService;

    @PostMapping("/identify")
    public ResponseEntity<?> identify(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal AuthUser authUser) {
        String imageData = body.get("imageData");
        String childName = body.getOrDefault("childName", "you");
        int childAge     = Integer.parseInt(body.getOrDefault("childAge", "4"));
        String subject   = body.getOrDefault("subject", "").trim();

        if (imageData == null || imageData.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "No image provided"));
        if (!quotaService.isFeatureEnabled(authUser.id(), "draw"))
            return ResponseEntity.status(403).body(Map.of("error", "Drawing is currently unavailable"));
        Long drawChildId = body.containsKey("childId") ? Long.parseLong(body.get("childId")) : null;
        if (!quotaService.tryConsume(authUser.id(), "draw", drawChildId))
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));

        String response = drawAgent.identifyDrawing(imageData, childName, childAge, subject);
        if (response == null)
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not identify drawing"));
        return ResponseEntity.ok(Map.of("response", response));
    }

    @PostMapping("/guide")
    public ResponseEntity<?> drawingGuide(@RequestBody Map<String, String> body,
                                          @AuthenticationPrincipal AuthUser authUser) {
        String subject   = body.getOrDefault("subject", "").trim();
        String childName = body.getOrDefault("childName", "you");
        int childAge     = Integer.parseInt(body.getOrDefault("childAge", "5"));

        if (subject.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "No subject provided"));
        if (!quotaService.isFeatureEnabled(authUser.id(), "draw"))
            return ResponseEntity.status(403).body(Map.of("error", "Drawing features are currently unavailable"));
        if (!quotaService.isFeatureEnabled(authUser.id(), "draw-guide"))
            return ResponseEntity.status(403).body(Map.of("error", "Drawing guide is not enabled"));
        Long guideChildId = body.containsKey("childId") ? Long.parseLong(body.get("childId")) : null;
        if (!quotaService.tryConsume(authUser.id(), "draw-guide", guideChildId))
            return ResponseEntity.status(429).body(Map.of("error", "Monthly limit reached"));

        String guide = drawAgent.generateGuide(subject, childName, childAge);
        if (guide == null)
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate guide"));
        return ResponseEntity.ok(Map.of("guide", guide));
    }
}
