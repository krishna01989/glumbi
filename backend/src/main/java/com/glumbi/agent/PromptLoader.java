package com.glumbi.agent;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Loads prompt templates from src/main/resources/prompts/*.txt.
 * Templates use standard %s / %d placeholders — callers pass them through String.format().
 * Files are cached after first read so there's no repeated I/O.
 */
@Component
public class PromptLoader {

    private final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    public String load(String name) {
        return cache.computeIfAbsent(name, key -> {
            try {
                var resource = new ClassPathResource("prompts/" + key + ".txt");
                return resource.getContentAsString(StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new IllegalStateException("Prompt file not found: prompts/" + key + ".txt", e);
            }
        });
    }
}
