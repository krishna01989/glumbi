package com.glumbi.controller;

import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.AudioTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/audio-token")
@RequiredArgsConstructor
public class AudioTokenController {

    private final AudioTokenService audioTokenService;

    /**
     * Issues a short-lived token for a specific audio resource.
     *
     * The frontend calls this with a normal Authorization header (Axios),
     * then embeds the returned stoken in the <audio src="..."> URL instead
     * of the JWT — so the JWT never appears in server logs or browser history.
     *
     * resource values: "learn", "story:{id}"
     */
    @PostMapping
    public ResponseEntity<?> issue(@RequestBody Map<String, String> body,
                                   @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) return ResponseEntity.status(401).build();

        String resource = body.get("resource");
        if (resource == null || resource.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "resource is required"));
        }

        String token = audioTokenService.issue(resource);
        return ResponseEntity.ok(Map.of(
                "stoken", token,
                "expiresIn", audioTokenService.getTtlSeconds()
        ));
    }
}
