package com.pvmanagement.repository;

import com.pvmanagement.domain.KpiDaily;
import com.pvmanagement.domain.PowerStation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface KpiDailyRepository extends JpaRepository<KpiDaily, Long> {
    List<KpiDaily> findByPowerStationOrderByKpiDateDesc(PowerStation powerStation);
    List<KpiDaily> findByPowerStationAndKpiDateBetweenOrderByKpiDateAsc(PowerStation powerStation, LocalDate from, LocalDate to);
    Optional<KpiDaily> findByPowerStationAndKpiDate(PowerStation powerStation, LocalDate date);
}
