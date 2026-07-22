package com.glumbi.controller;

import com.glumbi.agent.RelevanceGuard;
import com.glumbi.agent.SafetyGuard;
import com.glumbi.agent.StoryAgent;
import com.glumbi.service.TurnstileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {

    private final StoryAgent       storyAgent;
    private final TurnstileService turnstile;

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded != null ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
    }

    @PostMapping("/story")
    public ResponseEntity<?> demoStory(@RequestBody Map<String, String> body,
                                       HttpServletRequest request) {

        String token = body.getOrDefault("turnstileToken", "");
        if (!turnstile.verify(token, getClientIp(request))) {
            return ResponseEntity.status(403).body(Map.of(
                "error", "Security check failed. Please refresh the page and try again."
            ));
        }

        String childName = body.getOrDefault("childName", "").trim();
        String keywords  = body.getOrDefault("keywords",  "").trim();
        String category  = body.getOrDefault("category",  "adventure").trim();

        if (childName.isBlank() || keywords.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please enter a name and some keywords"));
        }
        if (childName.length() > 30 || keywords.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("error", "Input too long"));
        }

        try {
            String gender = (childName.hashCode() % 2 == 0) ? "girl" : "boy";
            StoryAgent.StoryResult result = storyAgent.generateStory(childName, 5, gender, keywords, category, "");
            return ResponseEntity.ok(Map.of(
                "title",   result.title(),
                "content", result.content()
            ));
        } catch (SafetyGuard.SafetyException | RelevanceGuard.RelevanceException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not generate story. Please try again!"));
        }
    }
}
