package com.pvmanagement.monitoring.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CurrentMeasurementsDto(
        OffsetDateTime timestamp,
        BigDecimal pvPowerW,
        BigDecimal batteryPowerW,
        BigDecimal loadPowerW,
        BigDecimal gridPowerW,
        BigDecimal stateOfCharge
//        List<InverterStatusDto> inverters,
//        KpiSnapshotDto kpi
) {
    public record InverterStatusDto(
            String serialNumber,
            String name,
            String status,
            Double pacW,
            Double etotalKWh,
            Double temperatureC,
            Double socPercent
    ) {}

    public record KpiSnapshotDto(
            String powerStationName,
            OffsetDateTime kpiTimestamp,
            Double productionTodayKWh,
            Double totalProductionKWh,
            Double pacW,
            Double yieldRate,
            Double dayIncomeEur
    ) {}
}
