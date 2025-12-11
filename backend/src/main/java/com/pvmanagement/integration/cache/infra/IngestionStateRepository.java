package com.pvmanagement.integration.cache.infra;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class IngestionStateRepository {

    private final JdbcTemplate jdbcTemplate;

    public IngestionStateRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Instant> findLastFetchedAt(String id) {
        List<Instant> rows = jdbcTemplate.query(
                "SELECT last_fetched_at FROM ingestion_state WHERE id = ?",
                (rs, rowNum) -> {
                    Timestamp ts = rs.getTimestamp("last_fetched_at");
                    return ts != null ? ts.toInstant() : null;
                },
                id
        );
        return rows.stream().filter(Objects::nonNull).findFirst();
    }

    public void upsert(String id, Instant instant) {
        jdbcTemplate.update(
                """
                INSERT INTO ingestion_state (id, last_fetched_at)
                VALUES (?, ?)
                ON CONFLICT (id) DO UPDATE SET last_fetched_at = EXCLUDED.last_fetched_at
                """,
                id,
                instant != null ? Timestamp.from(instant) : null
        );
    }
}
