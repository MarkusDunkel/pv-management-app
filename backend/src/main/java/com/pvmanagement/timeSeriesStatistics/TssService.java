package com.pvmanagement.timeSeriesStatistics;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TssService {

    public TssService() {}

    /**
     * Computes the diurnal mean profile in 15-minute intervals.
     *
     * @param series array of Timeseries records
     * @return map of 15-minute interval (LocalTime) to average value (BigDecimal)
     */
    public List<DayTimeValue> computeDiurnalMeanProfile(List<TimeValue> series) {

        if (series == null || series.isEmpty()) {
            return new ArrayList<>();
        }

        var withoutNull = series.stream().filter(it -> it.value() != null).toList();

        if (withoutNull.isEmpty()) {
            return new ArrayList<>();
        }

        // Group by 15-minute rounded LocalTime
        Map<OffsetTime, List<BigDecimal>> grouped = series.stream()
                .filter(t -> t.value() != null)
                .collect(Collectors.groupingBy(
                        t -> roundTo15Min(t.timestamp().toOffsetTime()),
                        TreeMap::new,
                        Collectors.mapping(TimeValue::value, Collectors.toList())
                ));

        // Compute mean per group
        List<DayTimeValue> diurnalMean=new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            BigDecimal sum = entry.getValue().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal mean = sum.divide(BigDecimal.valueOf(entry.getValue().size()), 6, RoundingMode.HALF_UP);
            diurnalMean.add(DayTimeValue.builder()
                    .timestamp(entry.getKey())
                    .value(mean)
                    .build());
        }

        return diurnalMean;
    }

    // Helper: rounds a LocalTime to the nearest 15-minute interval (e.g. 10:07 -> 10:00, 10:09 -> 10:15)
    private static OffsetTime roundTo15Min(OffsetTime time) {
        int minutes = time.getHour() * 60 + time.getMinute();
        int rounded = (int) (Math.round(minutes / 15.0) * 15);
        return OffsetTime.of(rounded / 60 % 24, rounded % 60,0,0, ZoneOffset.UTC);
    }

}
