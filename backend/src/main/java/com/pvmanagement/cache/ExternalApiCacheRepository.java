package com.pvmanagement.cache;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ExternalApiCacheRepository {

    private static final RowMapper<ExternalApiCacheEntry> ROW_MAPPER = (rs, rowNum) -> new ExternalApiCacheEntry(
            rs.getLong("id"),
            rs.getString("cache_key"),
            rs.getString("response_json"),
            (Integer) rs.getObject("status_code"),
            rs.getString("error_message"),
            rs.getTimestamp("fetched_at").toInstant(),
            rs.getInt("ttl_seconds")
    );

    private final JdbcTemplate jdbcTemplate;

    public ExternalApiCacheRepository(@Qualifier("cacheJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void upsert(ExternalApiCacheEntry entry) {
        jdbcTemplate.update("""
                INSERT INTO external_api_cache (cache_key, response_json, status_code, error_message, fetched_at, ttl_seconds)
                VALUES (?, ?::jsonb, ?, ?, ?, ?)
                ON CONFLICT (cache_key) DO UPDATE SET
                    response_json = EXCLUDED.response_json,
                    status_code = EXCLUDED.status_code,
                    error_message = EXCLUDED.error_message,
                    fetched_at = EXCLUDED.fetched_at,
                    ttl_seconds = EXCLUDED.ttl_seconds
                """,
                entry.cacheKey(),
                entry.responseJson(),
                entry.statusCode(),
                entry.errorMessage(),
                Timestamp.from(entry.fetchedAt()),
                entry.ttlSeconds()
        );
    }

    public List<ExternalApiCacheEntry> findAllNewerThan(Instant since) {
        if (since == null) {
            return jdbcTemplate.query(
                    "SELECT * FROM external_api_cache ORDER BY fetched_at ASC",
                    ROW_MAPPER
            );
        }
        return jdbcTemplate.query(
                "SELECT * FROM external_api_cache WHERE fetched_at > ? ORDER BY fetched_at ASC",
                ROW_MAPPER,
                Timestamp.from(since)
        );
    }
}
