package com.pvmanagement.service;

import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.dto.CurrentMeasurementsDto;
import com.pvmanagement.dto.DashboardSummaryDto;
import com.pvmanagement.dto.PowerStationDto;
import com.pvmanagement.dto.WeatherForecastDto;
import com.pvmanagement.repository.InverterRepository;
import com.pvmanagement.repository.KpiDailyRepository;
import com.pvmanagement.repository.PowerStationRepository;
import com.pvmanagement.repository.PowerflowSnapshotRepository;
import com.pvmanagement.repository.WeatherForecastRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PowerStationService {

    private final PowerStationRepository powerStationRepository;
    private final PowerflowSnapshotRepository powerflowSnapshotRepository;
    private final InverterRepository inverterRepository;
    private final KpiDailyRepository kpiDailyRepository;
    private final WeatherForecastRepository weatherForecastRepository;

    public PowerStationService(PowerStationRepository powerStationRepository,
                               PowerflowSnapshotRepository powerflowSnapshotRepository,
                               InverterRepository inverterRepository,
                               KpiDailyRepository kpiDailyRepository,
                               WeatherForecastRepository weatherForecastRepository) {
        this.powerStationRepository = powerStationRepository;
        this.powerflowSnapshotRepository = powerflowSnapshotRepository;
        this.inverterRepository = inverterRepository;
        this.kpiDailyRepository = kpiDailyRepository;
        this.weatherForecastRepository = weatherForecastRepository;
    }

    public PowerStationDto getPowerStation(Long id) {
        var station = powerStationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Power station not found"));
        return toDto(station);
    }

    public List<PowerStationDto> listPowerStations() {
        return powerStationRepository.findAll().stream().map(this::toDto).toList();
    }

    public DashboardSummaryDto buildDashboard(Long powerStationId) {
        var station = powerStationRepository.findById(powerStationId)
                .orElseThrow(() -> new IllegalArgumentException("Power station not found"));

        var snapshot = powerflowSnapshotRepository.findFirstByPowerStationOrderByTimestampDesc(station);
        var kpi = kpiDailyRepository.findByPowerStationOrderByKpiDateDesc(station).stream().findFirst();
        var inverters = inverterRepository.findByPowerStation(station);

        CurrentMeasurementsDto current = snapshot.map(snap -> new CurrentMeasurementsDto(
                snap.getTimestamp(),
                snap.getPvW(),
                snap.getBatteryW(),
                snap.getLoadW(),
                snap.getGridW(),
                snap.getSocPercent(),
                inverters.stream().map(inv -> new CurrentMeasurementsDto.InverterStatusDto(
                        inv.getSerialNumber(),
                        inv.getName(),
                        inv.getStatus(),
                        inv.getPacW(),
                        inv.getEtotalKWh(),
                        inv.getTemperatureC(),
                        inv.getSocPercent()
                )).toList(),
                kpi.map(k -> new CurrentMeasurementsDto.KpiSnapshotDto(
                        station.getStationname(),
                        snap.getTimestamp(),
                        toDouble(k.getPowerKWh()),
                        toDouble(k.getTotalPowerKWh()),
                        toDouble(k.getPacW()),
                        toDouble(k.getYieldRate()),
                        toDouble(k.getDayIncomeEur())
                )).orElse(null)
        )).orElse(null);

        var forecast = weatherForecastRepository.findByPowerStationAndForecastDateBetweenOrderByForecastDateAsc(
                station,
                LocalDate.now(),
                LocalDate.now().plusDays(6)
        ).stream().map(f -> new WeatherForecastDto(
                f.getForecastDate(),
                f.getCondTxtD(),
                f.getCondTxtN(),
                f.getPop(),
                f.getUvIndex(),
                f.getTmpMin(),
                f.getTmpMax(),
                f.getWindDir(),
                f.getWindSpd()
        )).collect(Collectors.toList());

        return new DashboardSummaryDto(toDto(station), current, forecast);
    }

    private Double toDouble(Number value) {
        return value == null ? null : value.doubleValue();
    }

    private PowerStationDto toDto(PowerStation station) {
        return new PowerStationDto(
                station.getId(),
                station.getStationname(),
                station.getAddress(),
                station.getLatitude(),
                station.getLongitude(),
                station.getCapacityKWp(),
                station.getBatteryCapacityKWh(),
                station.getStatus(),
                station.getOrgName(),
                station.getTurnonTime(),
                station.getCreateTime()
        );
    }
}
