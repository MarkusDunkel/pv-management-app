package com.pvmanagement.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record HistoryResponseDto(
        List<DataPoint> powerflow
//        List<InverterPoint> inverter,
//        List<KpiPoint> dailyKpi
) {
    public record DataPoint(OffsetDateTime timestamp,
                             BigDecimal pvW,
                             BigDecimal batteryW,
                             BigDecimal loadW,
                             BigDecimal gridW,
                             BigDecimal socPercent) {}

    public record InverterPoint(OffsetDateTime timestamp,
                                String inverterSerial,
                                Double pacW,
                                Double outputPowerW,
                                Double batteryPowerW) {}

    public record KpiPoint(String date,
                            Double productionKWh,
                            Double totalProductionKWh) {}
}
