package com.glumbi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class VoyageEmbeddingClient {

    private final ObjectMapper objectMapper;
    private final WebClient    webClient;
    private VendorConfigService vendorConfig;

    @Value("${voyage.api-key:}")      public  String apiKey;
    @Value("${voyage.embed-url}")     private String embedUrl;
    @Value("${voyage.model}")         private String model;
    @Value("${voyage.similar-limit}") public  int    similarLimit;

    public VoyageEmbeddingClient(ObjectMapper objectMapper, WebClient.Builder builder) {
        this.objectMapper = objectMapper;
        this.webClient    = builder.build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public boolean isAvailable() {
        return isConfigured() && vendorConfig.isEnabled(VendorConfigService.VOYAGE);
    }

    /** Calls Voyage AI and returns a pgvector-compatible string "[0.1,0.2,...]". */
    public String embed(String text) throws Exception {
        if (!vendorConfig.isEnabled(VendorConfigService.VOYAGE))
            throw new IllegalStateException("Voyage AI is currently disabled by the administrator.");
        String body = objectMapper.writeValueAsString(Map.of(
            "model", model,
            "input", List.of(text)
        ));

        String response = webClient.post()
            .uri(embedUrl)
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        JsonNode embedding = objectMapper.readTree(response).path("data").get(0).path("embedding");
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding.get(i).asDouble());
        }
        sb.append("]");
        return sb.toString();
    }
}
