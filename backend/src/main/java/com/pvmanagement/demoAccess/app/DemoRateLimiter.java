package com.pvmanagement.demoAccess.app;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Objects;

@Component
public class DemoRateLimiter {

    private static final int LIMIT_PER_MINUTE = 30;

    private final Cache<String, Bucket> buckets;

    public DemoRateLimiter() {
        this.buckets = Caffeine.newBuilder()
                               .expireAfterAccess(Duration.ofMinutes(10))
                               .build();
    }

    public boolean tryConsume(String key) {
        Bucket bucket = buckets.get(Objects.requireNonNullElse(key,
                                                               "anonymous"),
                                    this::newBucket);
        return bucket.tryConsume(1);
    }

    private Bucket newBucket(String ignored) {
        Bandwidth limit = Bandwidth.classic(LIMIT_PER_MINUTE,
                                            Refill.greedy(LIMIT_PER_MINUTE,
                                                          Duration.ofMinutes(1)));
        return Bucket.builder()
                     .addLimit(limit)
                     .build();
    }
}
