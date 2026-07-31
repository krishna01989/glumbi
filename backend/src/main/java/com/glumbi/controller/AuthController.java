package com.glumbi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.entity.AppUser;
import com.glumbi.entity.PasswordResetToken;
import com.glumbi.repository.PasswordResetTokenRepository;
import com.glumbi.repository.UserRepository;
import com.glumbi.security.JwtUtil;
import com.glumbi.service.AdminAlertService;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.EmailTemplates;
import com.glumbi.service.RateLimitService;
import com.glumbi.service.ResendClient;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.util.retry.Retry;

import java.io.IOException;
import java.net.SocketException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository              userRepo;
    private final PasswordResetTokenRepository resetTokenRepo;
    private final PasswordEncoder             encoder;
    private final JwtUtil                     jwtUtil;
    private final WebClient.Builder           webClientBuilder;
    private final ApiQuotaService             quotaService;
    private final RateLimitService            rateLimitService;
    private final ResendClient                resendClient;
    private final EmailTemplates              emailTemplates;
    private final AdminAlertService           adminAlertService;
    private final com.glumbi.service.SignupGuardService signupGuard;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${app.google.token-info-url}") private String googleTokenInfoUrl;
    @Value("${app.frontend-url}")          private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (!signupGuard.isSignupEnabled()) {
            return ResponseEntity.status(503)
                    .header("Retry-After", "86400")
                    .body(Map.of("code", "SIGNUP_PAUSED", "error", "We're pausing new sign-ups for now. Glumbi is growing fast and we want to make sure every family gets the best experience. Check back soon — we'd love to have you!"));
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }
        AppUser user = new AppUser();
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setQuotaLimit(quotaService.getDefaultMonthlyCredits());
        userRepo.save(user);
        resendClient.send(user.getEmail(), "Welcome to Glumbi! 🎉", emailTemplates.onboarding());
        adminAlertService.notifyUserRegistered(user, "Email");
        return ResponseEntity.ok(Map.of("token", jwtUtil.generate(user), "role", user.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        if (!rateLimitService.tryConsumeAuth(resolveIp(http))) {
            return ResponseEntity.status(429).body(Map.of("error", "Too many login attempts. Please try again in 15 minutes."));
        }
        return userRepo.findByEmail(req.getEmail().toLowerCase().trim())
                .filter(u -> u.getPasswordHash() != null && encoder.matches(req.getPassword(), u.getPasswordHash()))
                .map(u -> {
                    if (u.isOnHold()) return ResponseEntity.status(403).body(Map.of(
                        "error", "account_on_hold",
                        "reason", u.getHoldReason() != null ? u.getHoldReason() : "Your account has been suspended. Please contact support@glumbi.com."
                    ));
                    return ResponseEntity.ok(Map.of("token", jwtUtil.generate(u), "role", u.getRole().name()));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid email or password")));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing ID token"));
        }
        try {
            // Verify token with Google
            String raw = webClientBuilder.build()
                    .get()
                    .uri(googleTokenInfoUrl + "?id_token=" + idToken)
                    .retrieve()
                    .bodyToMono(String.class)
                    .retryWhen(Retry.backoff(2, Duration.ofSeconds(1))
                            .filter(e -> e instanceof IOException || e instanceof SocketException))
                    .block();

            JsonNode info = mapper.readTree(raw);

            if (info.has("error_description")) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid Google token"));
            }

            String sub   = info.path("sub").asText();
            String email = info.path("email").asText().toLowerCase().trim();
            String name  = info.path("name").asText("");

            // Find by Google sub first, fall back to email (handles existing email/password accounts)
            AppUser user = userRepo.findByGoogleSub(sub)
                    .orElseGet(() -> userRepo.findByEmail(email).orElse(null));

            boolean isNewUser = (user == null);
            if (isNewUser && !signupGuard.isSignupEnabled()) {
                return ResponseEntity.status(503)
                        .header("Retry-After", "86400")
                        .body(Map.of("code", "SIGNUP_PAUSED", "error", "We're pausing new sign-ups for now. Glumbi is growing fast and we want to make sure every family gets the best experience. Check back soon — we'd love to have you!"));
            }
            if (isNewUser) {
                user = new AppUser();
                user.setEmail(email);
                user.setDisplayName(name);
                user.setQuotaLimit(quotaService.getDefaultMonthlyCredits());
            }
            // Always keep sub up to date
            user.setGoogleSub(sub);
            if (user.getDisplayName() == null || user.getDisplayName().isBlank()) {
                user.setDisplayName(name);
            }
            userRepo.save(user);
            if (isNewUser) {
                resendClient.send(user.getEmail(), "Welcome to Glumbi! 🎉", emailTemplates.onboarding());
                adminAlertService.notifyUserRegistered(user, "Google");
            }

            if (user.isOnHold()) return ResponseEntity.status(403).body(Map.of(
                "error", "account_on_hold",
                "reason", user.getHoldReason() != null ? user.getHoldReason() : "Your account has been suspended. Please contact support@glumbi.com."
            ));

            return ResponseEntity.ok(Map.of(
                    "token", jwtUtil.generate(user),
                    "role",  user.getRole().name(),
                    "name",  name
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Google sign-in failed"));
        }
    }

    @Data
    public static class RegisterRequest {
        @Email(message = "Valid email required")
        @NotBlank
        private String email;

        @NotBlank
        @jakarta.validation.constraints.Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?]).{8,}$",
            message = "Password must be at least 8 characters and include an uppercase letter, a number, and a special character"
        )
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String password;
    }

    // Always return 200 regardless of whether email exists — prevents user enumeration
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body, HttpServletRequest http) {
        if (!rateLimitService.tryConsumeAuth(resolveIp(http))) {
            return ResponseEntity.status(429).body(Map.of("error", "Too many requests. Please try again in 15 minutes."));
        }
        String email = body.getOrDefault("email", "").toLowerCase().trim();
        var userOpt = userRepo.findByEmail(email);

        userOpt.ifPresent(user -> {
            if (user.getPasswordHash() == null) return;
            resetTokenRepo.invalidateAllForUser(user.getId());

            PasswordResetToken prt = new PasswordResetToken();
            prt.setToken(UUID.randomUUID().toString());
            prt.setUserId(user.getId());
            prt.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).plusHours(1));
            resetTokenRepo.save(prt);

            String resetUrl = frontendUrl + "/reset-password?token=" + prt.getToken();
            resendClient.send(
                user.getEmail(),
                "Reset your Glumbi password",
                emailTemplates.passwordReset(resetUrl, user.isAdminOrAbove())
            );
        });

        return ResponseEntity.ok(Map.of("message", "If that email is registered, you'll receive a reset link shortly."));
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        PasswordResetToken prt = resetTokenRepo.findByToken(token).orElse(null);
        if (prt == null || prt.isUsed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or already used reset link"));
        }
        if (prt.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This reset link has expired. Please request a new one."));
        }
        return ResponseEntity.ok(Map.of("valid", true));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token    = body.getOrDefault("token", "");
        String password = body.getOrDefault("password", "");

        if (token.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and password are required"));
        }

        String passwordPolicy = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;':\",./<>?]).{8,}$";
        if (!password.matches(passwordPolicy)) {
            return ResponseEntity.badRequest().body(Map.of("error",
                "Password must be at least 8 characters and include an uppercase letter, a number, and a special character"));
        }

        PasswordResetToken prt = resetTokenRepo.findByToken(token).orElse(null);
        if (prt == null || prt.isUsed()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or already used reset link"));
        }
        // Compare in UTC — safe regardless of user's timezone
        if (prt.isExpired()) {
            return ResponseEntity.badRequest().body(Map.of("error", "This reset link has expired. Please request a new one."));
        }

        AppUser user = userRepo.findById(prt.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        user.setPasswordHash(encoder.encode(password));
        userRepo.save(user);

        resendClient.send(
            user.getEmail(),
            "Your Glumbi password was changed",
            emailTemplates.passwordChanged("via a password reset link", user.isAdminOrAbove())
        );

        prt.setUsed(true);
        resetTokenRepo.save(prt);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }


    @GetMapping("/signup-status")
    public ResponseEntity<?> signupStatus() {
        return ResponseEntity.ok(Map.of("enabled", signupGuard.isSignupEnabled()));
    }

    // Railway sits behind a proxy — prefer X-Forwarded-For, fall back to remoteAddr
    private String resolveIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
