package com.glumbi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ResendClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${resend.api-key}") private String apiKey;
    @Value("${resend.from}")    private String from;

    public void send(String to, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) return;
        webClientBuilder.build()
            .post()
            .uri("https://api.resend.com/emails")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of(
                "from",    from,
                "to",      List.of(to),
                "subject", subject,
                "html",    html
            ))
            .retrieve()
            .bodyToMono(String.class)
            .timeout(Duration.ofSeconds(5))
            .subscribe(
                ok  -> {},
                err -> System.err.println("[ResendClient] Failed to send email to " + to + ": " + err.getMessage())
            );
    }
}
