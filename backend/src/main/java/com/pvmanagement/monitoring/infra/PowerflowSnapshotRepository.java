package com.pvmanagement.monitoring.infra;

import com.pvmanagement.monitoring.domain.PowerStation;
import com.pvmanagement.monitoring.domain.PowerflowSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface PowerflowSnapshotRepository extends JpaRepository<PowerflowSnapshot, Long> {
    Optional<PowerflowSnapshot> findFirstByPowerStationOrderByPowerflowTimestampDesc(PowerStation powerStation);
    List<PowerflowSnapshot> findByPowerStationAndPowerflowTimestampBetweenOrderByPowerflowTimestampAsc(PowerStation powerStation,
                                                                                   OffsetDateTime from,
                                                                                   OffsetDateTime to);
    boolean existsByPowerStationAndPowerflowTimestamp(PowerStation powerStation, OffsetDateTime powerflowTimestamp);
}
