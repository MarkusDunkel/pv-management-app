package com.pvmanagement.timeSeriesStatistics;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Builder
public record TimeValue (
        OffsetDateTime timestamp,
        BigDecimal value
) {

}
