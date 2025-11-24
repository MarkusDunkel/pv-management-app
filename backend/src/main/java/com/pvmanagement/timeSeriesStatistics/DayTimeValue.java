package com.pvmanagement.timeSeriesStatistics;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record DayTimeValue (
        java.time.OffsetTime timestamp,
        BigDecimal value

) {}
