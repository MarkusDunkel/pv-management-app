package com.pvmanagement.dto;

import java.util.List;

public record DashboardSummaryDto(
        PowerStationDto powerStation,
        CurrentMeasurementsDto currentMeasurements
//        List<WeatherForecastDto> forecast
) {
}
