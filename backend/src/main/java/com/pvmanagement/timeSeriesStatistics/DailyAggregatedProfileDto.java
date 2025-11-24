package com.pvmanagement.timeSeriesStatistics;

public record DailyAggregatedProfileDto(AggregationType aggregationType,
        DayTimeValue[] dailyAggregatedProfile
        ) {
}
