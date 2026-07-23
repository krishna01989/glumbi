package com.glumbi.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class TurnstileService {

    @Value("${app.turnstile.verify-url}")
    private String verifyUrl;

    @Value("${app.turnstile.secret:}")
    private String secret;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean verify(String token, String remoteIp) {
            // If no secret configured (local dev), skip verification
        if (secret == null || secret.isBlank()) {
            log.warn("No Turnstile secret configured — skipping verification");
            return true;
        }
        if (token == null || token.isBlank()) return false;

        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret",   secret);
            body.add("response", token);
            if (remoteIp != null) body.add("remoteip", remoteIp);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(verifyUrl, body, Map.class);
            return response != null && Boolean.TRUE.equals(response.get("success"));
        } catch (Exception e) {
            return false;
        }
    }
}
