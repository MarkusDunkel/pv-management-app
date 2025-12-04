package com.pvmanagement.panelSizeOptimizer;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record PsoRequest(String electricityCosts,
        String electricitySellingPrice,
        String currentCapacity,
        String performanceRatio,
        String reininvesttime,
        String panelcost) {
}
