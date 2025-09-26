package com.pvmanagement.repository;

import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.domain.SemSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SemSyncLogRepository extends JpaRepository<SemSyncLog, Long> {
    Optional<SemSyncLog> findFirstByPowerStationOrderByLastSuccessAtDesc(PowerStation powerStation);
}
