package com.pvmanagement.repository;

import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.domain.PowerflowSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface PowerflowSnapshotRepository extends JpaRepository<PowerflowSnapshot, Long> {
    Optional<PowerflowSnapshot> findFirstByPowerStationOrderByPowerflowTimestampDesc(PowerStation powerStation);
    List<PowerflowSnapshot> findByPowerStationAndTimestampBetweenOrderByPowerflowTimestampAsc(PowerStation powerStation,
                                                                                   OffsetDateTime from,
                                                                                   OffsetDateTime to);
}
