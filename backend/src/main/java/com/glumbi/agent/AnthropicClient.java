package com.glumbi.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

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

        // Connection pool that validates connections before use — prevents "Operation timed out"
        // errors on the first request after a long idle period (stale pooled connections).
        ConnectionProvider provider = ConnectionProvider.builder("anthropic")
                .maxConnections(20)
                .maxIdleTime(Duration.ofSeconds(30))   // evict idle connections after 30s
                .maxLifeTime(Duration.ofMinutes(5))    // recycle connections every 5 min
                .pendingAcquireTimeout(Duration.ofSeconds(10))
                .evictInBackground(Duration.ofSeconds(30))
                .build();

        HttpClient httpClient = HttpClient.create(provider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofSeconds(90))
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(90, TimeUnit.SECONDS)));

        this.webClient = builder
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
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
