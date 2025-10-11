package com.pvmanagement.service;

import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.dto.*;
import com.pvmanagement.repository.PowerStationRepository;
import com.pvmanagement.repository.PowerflowSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class PowerStationService {

    private final PowerStationRepository powerStationRepository;
    private final PowerflowSnapshotRepository powerflowSnapshotRepository;

    public PowerStationService(PowerStationRepository powerStationRepository, PowerflowSnapshotRepository powerflowSnapshotRepository) {
        this.powerStationRepository = powerStationRepository;
        this.powerflowSnapshotRepository = powerflowSnapshotRepository;
    }

    public PowerStationDto getPowerStation(Long id) {
        var station = powerStationRepository.findById(id)
                                            .orElseThrow(() -> new IllegalArgumentException("Power station not found"));
        return toDto(station);
    }

    public List<PowerStationDto> listPowerStations() {
        return powerStationRepository.findAll()
                                     .stream()
                                     .map(this::toDto)
                                     .toList();
    }

    public DashboardSummaryDto buildDashboard(Long powerStationId) {
        var station = powerStationRepository.findById(powerStationId)
                                            .orElseThrow(() -> new IllegalArgumentException("Power station not found"));
        var snapshot = powerflowSnapshotRepository.findFirstByPowerStationOrderByPowerflowTimestampDesc(station);
        OffsetDateTime to = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime from = OffsetDateTime.of(1970,
                                                1,
                                                1,
                                                0,
                                                0,
                                                0,
                                                0,
                                                ZoneOffset.UTC);
        var history = powerflowSnapshotRepository.findByPowerStationAndPowerflowTimestampBetweenOrderByPowerflowTimestampAsc(station,
                                                                                                                             from,
                                                                                                                             to);

        CurrentMeasurementsDto current = snapshot.map(snap -> new CurrentMeasurementsDto(snap.getPowerflowTimestamp(),
                                                                                         snap.getPvW(),
                                                                                         snap.getBatteryW(),
                                                                                         snap.getLoadW(),
                                                                                         snap.getGridW(),
                                                                                         snap.getSocPercent()))
                                                 .orElse(null);

        List<HistoryResponseDto> historyResponse = history.stream()
                                                          .map(point -> new HistoryResponseDto(point.getPowerflowTimestamp(),
                                                                                               point.getPvW(),
                                                                                               point.getBatteryW(),
                                                                                               point.getLoadW(),
                                                                                               point.getGridW(),
                                                                                               point.getSocPercent()))
                                                          .toList();

        return new DashboardSummaryDto(toDto(station),
                                       current,
                                       historyResponse);
    }

    private Double toDouble(Number value) {
        return value == null ?
                null :
                value.doubleValue();
    }

    private PowerStationDto toDto(PowerStation station) {
        return new PowerStationDto(station.getId(),
                                   station.getStationname(),
                                   station.getAddress(),
                                   station.getLatitude(),
                                   station.getLongitude(),
                                   station.getCapacityKWp(),
                                   station.getBatteryCapacityKWh(),
                                   station.getStatus(),
                                   station.getOrgName(),
                                   station.getTurnonTime(),
                                   station.getCreateTime());
    }
}
