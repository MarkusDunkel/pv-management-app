package com.pvmanagement.integration.cache.domain;

import java.time.Instant;

public record ExternalApiCacheEntry(
        Long id,
        String cacheKey,
        String responseJson,
        Integer statusCode,
        String errorMessage,
        Instant fetchedAt,
        Integer ttlSeconds
) {
}
