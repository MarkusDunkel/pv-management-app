package com.pvmanagement.dto;

public record DashboardSummaryDto(
        PowerStationDto powerStation,
        CurrentMeasurementsDto currentMeasurements
) {
}
