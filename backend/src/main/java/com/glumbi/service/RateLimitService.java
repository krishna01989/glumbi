package com.glumbi.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    public enum Endpoint { STORY, ACTIVITY, CURIOSITY, READ_QUIZ, WRITING }

    // key = "userId:ENDPOINT"
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(Long userId, Endpoint endpoint) {
        String key = userId + ":" + endpoint.name();
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(endpoint));
        return bucket.tryConsume(1);
    }

    private Bucket newBucket(Endpoint endpoint) {
        Bandwidth limit = switch (endpoint) {
            case STORY      -> Bandwidth.classic(10, Refill.greedy(10, Duration.ofHours(1)));
            case ACTIVITY   -> Bandwidth.classic(10, Refill.greedy(10, Duration.ofHours(1)));
            case CURIOSITY  -> Bandwidth.classic(20, Refill.greedy(20, Duration.ofHours(1)));
            case READ_QUIZ  -> Bandwidth.classic(10, Refill.greedy(10, Duration.ofHours(1)));
            case WRITING    -> Bandwidth.classic(10, Refill.greedy(10, Duration.ofHours(1)));
        };
        return Bucket.builder().addLimit(limit).build();
    }
}
