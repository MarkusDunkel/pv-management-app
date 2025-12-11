package com.pvmanagement.monitoring.domain;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record HistoryRequestDto(
        @NotNull(message = "from is required") OffsetDateTime from,
        @NotNull(message = "to is required") OffsetDateTime to
) {
}
