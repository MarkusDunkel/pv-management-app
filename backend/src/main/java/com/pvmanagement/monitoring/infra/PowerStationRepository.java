package com.pvmanagement.monitoring.infra;

import com.pvmanagement.monitoring.domain.PowerStation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PowerStationRepository extends JpaRepository<PowerStation, Long> {
    Optional<PowerStation> findByStationname(String stationname);
}
