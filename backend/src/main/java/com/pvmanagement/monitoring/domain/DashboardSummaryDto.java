package com.pvmanagement.monitoring.domain;

import java.util.List;

public record DashboardSummaryDto(
        PowerStationDto powerStation,
        CurrentMeasurementsDto currentMeasurements,
        List<HistoryResponseDto> history
) {
}
