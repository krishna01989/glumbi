package com.glumbi.agent;

import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Shared HTTP client for the Anthropic Messages API.
 * Centralises the base URL, API key header, and version header so no agent
 * needs to know any of those details.
 */
@Component
public class AnthropicClient {

    private final WebClient webClient;
    private final String messagesPath;

    public AnthropicClient(
            WebClient.Builder builder,
            @Value("${anthropic.api-key}")      String apiKey,
            @Value("${anthropic.base-url}")     String baseUrl,
            @Value("${anthropic.version}")      String version,
            @Value("${anthropic.messages-path}") String messagesPath) {

        this.messagesPath = messagesPath;
        this.webClient = builder
                .baseUrl(baseUrl)
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", version)
                .defaultHeader("content-type", "application/json")
                .build();
    }

    public String call(ObjectNode body) {
        return webClient.post()
                .uri(messagesPath)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
