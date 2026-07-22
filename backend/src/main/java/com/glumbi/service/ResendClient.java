package com.glumbi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ResendClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${resend.api-key}")   private String apiKey;
    @Value("${resend.from}")      private String from;
    @Value("${resend.send-url}")  private String sendUrl;
    @Value("${resend.batch-url}") private String batchUrl;
    @Value("${resend.enabled}")   private boolean enabled;

    /** Send to a list of recipients in chunks of 100 via Resend batch API. Fire-and-forget. */
    public void sendBatch(List<String> recipients, String subject, String html) {
        if (!enabled || apiKey == null || apiKey.isBlank() || recipients.isEmpty()) return;
        int chunkSize = 100;
        for (int i = 0; i < recipients.size(); i += chunkSize) {
            final int chunkStart = i;
            List<String> chunk = recipients.subList(chunkStart, Math.min(chunkStart + chunkSize, recipients.size()));
            List<Map<String, Object>> batch = new ArrayList<>();
            for (String to : chunk) {
                batch.add(Map.of("from", from, "to", List.of(to), "subject", subject, "html", html));
            }
            webClientBuilder.build()
                .post()
                .uri(batchUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(batch)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(30))
                .subscribe(
                    ok  -> {},
                    err -> System.err.println("[ResendClient] Batch send failed (chunk starting at " + chunkStart + "): " + err.getMessage())
                );
        }
    }

    public void send(String to, String subject, String html) {
        if (!enabled || apiKey == null || apiKey.isBlank()) return;
        webClientBuilder.build()
            .post()
            .uri(sendUrl)
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
