//package com.pvmanagement.repository;
//
//import com.pvmanagement.domain.EnergyStatisticsTotals;
//import com.pvmanagement.domain.PowerStation;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.Optional;
//
//public interface EnergyStatisticsTotalsRepository extends JpaRepository<EnergyStatisticsTotals, Long> {
//    Optional<EnergyStatisticsTotals> findFirstByPowerStationOrderByIdDesc(PowerStation powerStation);
//}
