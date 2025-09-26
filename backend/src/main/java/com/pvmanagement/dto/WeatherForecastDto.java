package com.pvmanagement.dto;

import java.time.LocalDate;

public record WeatherForecastDto(
        LocalDate forecastDate,
        String summaryDay,
        String summaryNight,
        Integer pop,
        Integer uvIndex,
        Double temperatureMin,
        Double temperatureMax,
        String windDirection,
        Double windSpeedKph
) {
}
