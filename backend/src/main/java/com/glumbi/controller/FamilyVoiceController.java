package com.glumbi.controller;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.FamilyVoice;
import com.glumbi.repository.FamilyVoiceRepository;
import com.glumbi.repository.UserRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import com.glumbi.service.ElevenLabsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/voices")
@RequiredArgsConstructor
public class FamilyVoiceController {

    private static final int MAX_VOICES = 5;

    private final FamilyVoiceRepository voiceRepository;
    private final UserRepository        userRepository;
    private final ElevenLabsService     elevenLabsService;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal AuthUser authUser) {
        List<FamilyVoice> voices = voiceRepository.findByUserIdOrderByCreatedAtAsc(authUser.id());
        return ResponseEntity.ok(voices.stream().map(v -> Map.of(
            "id",        (Object) v.getId(),
            "name",      (Object) v.getName(),
            "createdAt", (Object) v.getCreatedAt().toString()
        )).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal AuthUser authUser,
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name) {

        if (!elevenLabsService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("error", "Voice cloning is not available."));
        }
        if (name == null || name.isBlank() || name.length() > 50) {
            return ResponseEntity.badRequest().body(Map.of("error", "Voice name must be 1–50 characters."));
        }
        if (voiceRepository.countByUserId(authUser.id()) >= MAX_VOICES) {
            return ResponseEntity.badRequest().body(Map.of("error", "You can have up to " + MAX_VOICES + " custom voices."));
        }

        AppUser user = userRepository.findById(authUser.id())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        try {
            String elName = String.format("Glumbi | %s | User%d | %s",
                    name.trim(), authUser.id(),
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")));
            String voiceId = elevenLabsService.cloneVoice(file.getBytes(), file.getOriginalFilename(), elName);
            FamilyVoice voice = new FamilyVoice();
            voice.setUser(user);
            voice.setName(name.trim());
            voice.setElevenLabsVoiceId(voiceId);
            voiceRepository.save(voice);
            return ResponseEntity.ok(Map.of(
                "id",   voice.getId(),
                "name", voice.getName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to clone voice: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/name")
    public ResponseEntity<?> rename(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        FamilyVoice voice = voiceRepository.findById(id).orElse(null);
        if (voice == null || !voice.getUser().getId().equals(authUser.id())) {
            return ResponseEntity.notFound().build();
        }
        String name = body.get("name");
        if (name == null || name.isBlank() || name.length() > 50) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name must be 1–50 characters."));
        }
        voice.setName(name.trim());
        voiceRepository.save(voice);
        return ResponseEntity.ok(Map.of("id", voice.getId(), "name", voice.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable Long id) {

        FamilyVoice voice = voiceRepository.findById(id).orElse(null);
        if (voice == null || !voice.getUser().getId().equals(authUser.id())) {
            return ResponseEntity.notFound().build();
        }
        try {
            elevenLabsService.deleteVoice(voice.getElevenLabsVoiceId());
        } catch (Exception ignored) {}
        voiceRepository.delete(voice);
        return ResponseEntity.noContent().build();
    }
}
