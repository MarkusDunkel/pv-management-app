package com.pvmanagement.repository;

import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.domain.WeatherForecast;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WeatherForecastRepository extends JpaRepository<WeatherForecast, Long> {
    List<WeatherForecast> findByPowerStationAndForecastDateBetweenOrderByForecastDateAsc(PowerStation powerStation,
                                                                                        LocalDate from,
                                                                                        LocalDate to);
}
