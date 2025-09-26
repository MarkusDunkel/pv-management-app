//package com.pvmanagement.repository;
//
//import com.pvmanagement.domain.EnergyStatisticsDaily;
//import com.pvmanagement.domain.PowerStation;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.time.LocalDate;
//import java.util.List;
//
//public interface EnergyStatisticsDailyRepository extends JpaRepository<EnergyStatisticsDaily, Long> {
//    List<EnergyStatisticsDaily> findByPowerStationAndStatDateBetweenOrderByStatDateAsc(PowerStation powerStation,
//                                                                                      LocalDate from,
//                                                                                      LocalDate to);
//}
