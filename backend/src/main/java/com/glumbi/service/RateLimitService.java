package com.glumbi.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    public enum Endpoint { STORY, ACTIVITY, CURIOSITY, READ_QUIZ, WRITING, MEMORY }

    // Evict buckets for users inactive for longer than the TTL — prevents unbounded growth
    private final Cache<String, Bucket> buckets;

    public RateLimitService(@Value("${app.cache.rate-limit-ttl-hours:2}") int ttlHours) {
        this.buckets = Caffeine.newBuilder()
                .expireAfterAccess(ttlHours, TimeUnit.HOURS)
                .build();
    }

    public boolean tryConsume(Long userId, Endpoint endpoint) {
        String key = userId + ":" + endpoint.name();
        Bucket bucket = buckets.get(key, k -> newBucket(endpoint));
        return bucket.tryConsume(1);
    }

    private Bucket newBucket(Endpoint endpoint) {
        Bandwidth limit = switch (endpoint) {
            case STORY      -> Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofHours(1)).build();
            case ACTIVITY   -> Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofHours(1)).build();
            case CURIOSITY  -> Bandwidth.builder().capacity(20).refillGreedy(20, Duration.ofHours(1)).build();
            case READ_QUIZ  -> Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofHours(1)).build();
            case WRITING    -> Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofHours(1)).build();
            case MEMORY     -> Bandwidth.builder().capacity(15).refillGreedy(15, Duration.ofHours(1)).build();
        };
        return Bucket.builder().addLimit(limit).build();
    }
}
