package com.glumbi.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Issues short-lived signed tokens for audio streaming URLs.
 *
 * Why: browser <audio> elements can't set Authorization headers — they fire raw HTTP
 * requests (including Range requests for seeking). Rather than embedding the JWT in
 * the URL (where it lands in server logs and browser history), we issue a token scoped
 * to a specific audio resource. Range requests reuse the same token within the TTL window.
 */
@Service
public class AudioTokenService {

    @Value("${app.cache.audio-token-ttl-hours:8}") private int ttlHours;

    // key = stoken UUID, value = resource identifier (e.g. "learn", "story:41")
    private Cache<String, String> tokenCache;

    @PostConstruct
    void init() {
        tokenCache = Caffeine.newBuilder()
                .expireAfterWrite(ttlHours, TimeUnit.HOURS)
                .maximumSize(5000)
                .build();
    }

    /** Issue a new token for the given resource. */
    public String issue(String resource) {
        String token = UUID.randomUUID().toString();
        tokenCache.put(token, resource);
        return token;
    }

    /**
     * Validate that the token was issued for the expected resource.
     * Does NOT consume/invalidate — Range requests reuse the same token.
     */
    public boolean validate(String token, String resource) {
        if (token == null || token.isBlank()) return false;
        String stored = tokenCache.getIfPresent(token);
        return resource.equals(stored);
    }

    public int getTtlSeconds() {
        return ttlHours * 3600;
    }
}
