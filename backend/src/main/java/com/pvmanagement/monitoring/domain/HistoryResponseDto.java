package com.pvmanagement.monitoring.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record HistoryResponseDto(OffsetDateTime timestamp,
                                 BigDecimal pvW,
                                 BigDecimal batteryW,
                                 BigDecimal loadW,
                                 BigDecimal gridW,
                                 BigDecimal socPercent) {
};

