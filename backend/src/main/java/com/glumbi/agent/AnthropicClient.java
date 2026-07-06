package com.glumbi.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Shared HTTP client for the Anthropic Messages API.
 * Supports prompt caching via structured system blocks.
 */
@Component
public class AnthropicClient {

    private static final String BETA_CACHE_HEADER = "prompt-caching-2024-07-31";

    private final WebClient webClient;
    private final String messagesPath;
    private final ObjectMapper mapper = new ObjectMapper();

    public AnthropicClient(
            WebClient.Builder builder,
            @Value("${anthropic.api-key}")       String apiKey,
            @Value("${anthropic.base-url}")      String baseUrl,
            @Value("${anthropic.version}")       String version,
            @Value("${anthropic.messages-path}") String messagesPath) {

        this.messagesPath = messagesPath;
        this.webClient = builder
                .baseUrl(baseUrl)
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", version)
                .defaultHeader("anthropic-beta", BETA_CACHE_HEADER)
                .defaultHeader("content-type", "application/json")
                .build();
    }

    /** Plain call — system passed as a string (legacy, no caching). */
    public String call(ObjectNode body) {
        return webClient.post()
                .uri(messagesPath)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    /**
     * Call with a structured system prompt split into two blocks:
     *  1. preamble — marked cache_control: ephemeral (stable across all agents)
     *  2. agentPrompt — not cached (may vary per call)
     *
     * The body must NOT have a "system" key already set.
     */
    public String callWithCachedSystem(ObjectNode body, String preamble, String agentPrompt) {
        ArrayNode systemArray = mapper.createArrayNode();

        ObjectNode preambleBlock = mapper.createObjectNode();
        preambleBlock.put("type", "text");
        preambleBlock.put("text", preamble);
        preambleBlock.putObject("cache_control").put("type", "ephemeral");
        systemArray.add(preambleBlock);

        ObjectNode agentBlock = mapper.createObjectNode();
        agentBlock.put("type", "text");
        agentBlock.put("text", agentPrompt);
        systemArray.add(agentBlock);

        body.set("system", systemArray);

        return webClient.post()
                .uri(messagesPath)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    /**
     * Call with a single cached system block (no preamble split needed).
     */
    public String callWithCachedSystem(ObjectNode body, String systemPrompt) {
        ArrayNode systemArray = mapper.createArrayNode();

        ObjectNode block = mapper.createObjectNode();
        block.put("type", "text");
        block.put("text", systemPrompt);
        block.putObject("cache_control").put("type", "ephemeral");
        systemArray.add(block);

        body.set("system", systemArray);

        return webClient.post()
                .uri(messagesPath)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
