package com.pvmanagement.monitoring.infra;

import com.pvmanagement.monitoring.domain.PowerStation;
import com.pvmanagement.monitoring.domain.SemSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SemSyncLogRepository extends JpaRepository<SemSyncLog, Long> {
    Optional<SemSyncLog> findFirstByPowerStationOrderByLastSuccessAtDesc(PowerStation powerStation);
}
