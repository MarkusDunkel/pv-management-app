package com.pvmanagement.monitoring.app;

import com.pvmanagement.monitoring.domain.PowerStation;
import com.pvmanagement.monitoring.domain.CurrentMeasurementsDto;
import com.pvmanagement.monitoring.domain.HistoryRequestDto;
import com.pvmanagement.monitoring.domain.HistoryResponseDto;
import com.pvmanagement.monitoring.infra.PowerStationRepository;
import com.pvmanagement.monitoring.infra.PowerflowSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class MeasurementService {

    private final PowerStationRepository powerStationRepository;
    private final PowerflowSnapshotRepository powerflowSnapshotRepository;

    public MeasurementService(PowerStationRepository powerStationRepository,
                              PowerflowSnapshotRepository powerflowSnapshotRepository
    ) {
        this.powerStationRepository = powerStationRepository;
        this.powerflowSnapshotRepository = powerflowSnapshotRepository;
    }

    public CurrentMeasurementsDto current(Long powerStationId) {
        PowerStation station = powerStationRepository.findById(powerStationId)
                .orElseThrow(() -> new IllegalArgumentException("Power station not found"));

        var snapshot = powerflowSnapshotRepository.findFirstByPowerStationOrderByPowerflowTimestampDesc(station)
                .orElse(null);

        if (snapshot == null) {
            return null;
        }

        return new CurrentMeasurementsDto(
                snapshot.getPowerflowTimestamp(),
                snapshot.getPvW(),
                snapshot.getBatteryW(),
                snapshot.getLoadW(),
                snapshot.getGridW(),
                snapshot.getSocPercent()
        );
    }

    public List<HistoryResponseDto> history(Long powerStationId, HistoryRequestDto request) {
        PowerStation station = powerStationRepository.findById(powerStationId)
                .orElseThrow(() -> new IllegalArgumentException("Power station not found"));

        OffsetDateTime from = request.from();
        OffsetDateTime to = request.to();

        var history = powerflowSnapshotRepository
                .findByPowerStationAndPowerflowTimestampBetweenOrderByPowerflowTimestampAsc(station, from, to)
                .stream()
                .map(snap -> new HistoryResponseDto(
                        snap.getPowerflowTimestamp(),
                        snap.getPvW(),
                        snap.getBatteryW(),
                        snap.getLoadW(),
                        snap.getGridW(),
                        snap.getSocPercent()
                )).toList();

        return history;
    }
}
