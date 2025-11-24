package com.pvmanagement.panelSizeOptimizer;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record PsoRequest(BigDecimal electricityCosts,
        BigDecimal electricitySellingPrice,
        BigDecimal currentCapacity,
        BigDecimal performanceRatio,
        int reininvesttime,
        BigDecimal panelcost) {
}
