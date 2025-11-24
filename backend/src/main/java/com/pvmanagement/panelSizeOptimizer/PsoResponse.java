package com.pvmanagement.panelSizeOptimizer;

import com.pvmanagement.timeSeriesStatistics.DayTimeValue;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record PsoResponse(List<DayTimeValue> diurnalAggregatedConsumption,
        List<List<DayTimeValue>> diurnalAggregatedPvProductions,
        List<BigDecimal> pvCapacities,
        List<BigDecimal> fitAmounts,
        List<BigDecimal> excessAmounts,
        List<BigDecimal> lackAmounts,
        List<BigDecimal> totalAmounts
) {
}
