package com.pvmanagement.monitoring.domain;

import java.time.OffsetDateTime;

public record PowerStationDto(
        Long id,
        String stationname,
        String address,
        Double latitude,
        Double longitude,
        Double capacityKWp,
        Double batteryCapacityKWh,
        String status,
        String orgName,
        OffsetDateTime turnonTime,
        OffsetDateTime createTime
) {
}
