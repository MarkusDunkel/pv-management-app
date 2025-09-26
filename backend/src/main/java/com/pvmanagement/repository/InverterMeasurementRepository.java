package com.pvmanagement.repository;

import com.pvmanagement.domain.Inverter;
import com.pvmanagement.domain.InverterMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface InverterMeasurementRepository extends JpaRepository<InverterMeasurement, Long> {
    List<InverterMeasurement> findByInverterAndTimestampBetweenOrderByTimestampAsc(Inverter inverter,
                                                                                   OffsetDateTime from,
                                                                                   OffsetDateTime to);
}
