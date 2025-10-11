package com.pvmanagement.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record HistoryResponseDto(OffsetDateTime timestamp,
                                 BigDecimal pvW,
                                 BigDecimal batteryW,
                                 BigDecimal loadW,
                                 BigDecimal gridW,
                                 BigDecimal socPercent) {
};

