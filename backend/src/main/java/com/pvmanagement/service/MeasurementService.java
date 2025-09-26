package com.pvmanagement.service;

import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.dto.CurrentMeasurementsDto;
import com.pvmanagement.dto.HistoryRequestDto;
import com.pvmanagement.dto.HistoryResponseDto;
//import com.pvmanagement.repository.InverterMeasurementRepository;
//import com.pvmanagement.repository.InverterRepository;
//import com.pvmanagement.repository.KpiDailyRepository;
import com.pvmanagement.repository.PowerStationRepository;
import com.pvmanagement.repository.PowerflowSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;

@Service
@Transactional(readOnly = true)
public class MeasurementService {

    private final PowerStationRepository powerStationRepository;
    private final PowerflowSnapshotRepository powerflowSnapshotRepository;
//    private final InverterRepository inverterRepository;
//    private final InverterMeasurementRepository inverterMeasurementRepository;
//    private final KpiDailyRepository kpiDailyRepository;

    public MeasurementService(PowerStationRepository powerStationRepository,
                              PowerflowSnapshotRepository powerflowSnapshotRepository
//                              InverterRepository inverterRepository,
//                              InverterMeasurementRepository inverterMeasurementRepository,
//                              KpiDailyRepository kpiDailyRepository
    ) {
        this.powerStationRepository = powerStationRepository;
        this.powerflowSnapshotRepository = powerflowSnapshotRepository;
//        this.inverterRepository = inverterRepository;
//        this.inverterMeasurementRepository = inverterMeasurementRepository;
//        this.kpiDailyRepository = kpiDailyRepository;
    }

    public CurrentMeasurementsDto current(Long powerStationId) {
        PowerStation station = powerStationRepository.findById(powerStationId)
                .orElseThrow(() -> new IllegalArgumentException("Power station not found"));

        var snapshot = powerflowSnapshotRepository.findFirstByPowerStationOrderByPowerflowTimestampDesc(station)
                .orElse(null);

        if (snapshot == null) {
            return null;
        }

//        var inverters = inverterRepository.findByPowerStation(station);
//        var kpi = kpiDailyRepository.findByPowerStationOrderByKpiDateDesc(station).stream().findFirst();

        return new CurrentMeasurementsDto(
                snapshot.getPowerflowTimestamp(),
                snapshot.getPvW(),
                snapshot.getBatteryW(),
                snapshot.getLoadW(),
                snapshot.getGridW(),
                snapshot.getSocPercent()
//                inverters.stream().map(inv -> new CurrentMeasurementsDto.InverterStatusDto(
//                        inv.getSerialNumber(),
//                        inv.getName(),
//                        inv.getStatus(),
//                        inv.getPacW(),
//                        inv.getEtotalKWh(),
//                        inv.getTemperatureC(),
//                        inv.getSocPercent()
//                )).toList(),
//                kpi.map(k -> new CurrentMeasurementsDto.KpiSnapshotDto(
//                        station.getStationname(),
//                        snapshot.getTimestamp(),
//                        toDouble(k.getPowerKWh()),
//                        toDouble(k.getTotalPowerKWh()),
//                        toDouble(k.getPacW()),
//                        toDouble(k.getYieldRate()),
//                        toDouble(k.getDayIncomeEur())
//                )).orElse(null)
        );
    }

    public HistoryResponseDto history(Long powerStationId, HistoryRequestDto request) {
        PowerStation station = powerStationRepository.findById(powerStationId)
                .orElseThrow(() -> new IllegalArgumentException("Power station not found"));

        OffsetDateTime from = request.from();
        OffsetDateTime to = request.to();

        var powerflow = powerflowSnapshotRepository
                .findByPowerStationAndTimestampBetweenOrderByPowerflowTimestampAsc(station, from, to)
                .stream()
                .map(snap -> new HistoryResponseDto.DataPoint(
                        snap.getPowerflowTimestamp(),
                        snap.getPvW(),
                        snap.getBatteryW(),
                        snap.getLoadW(),
                        snap.getGridW(),
                        snap.getSocPercent()
                )).toList();

//        var inverterPoints = new ArrayList<HistoryResponseDto.InverterPoint>();
//        inverterRepository.findByPowerStation(station).forEach(inverter ->
//                inverterMeasurementRepository
//                        .findByInverterAndTimestampBetweenOrderByTimestampAsc(inverter, from, to)
//                        .forEach(measurement -> inverterPoints.add(new HistoryResponseDto.InverterPoint(
//                                measurement.getTimestamp(),
//                                inverter.getSerialNumber(),
//                                inverter.getPacW(),
//                                measurement.getOutputPowerW(),
//                                measurement.getBatteryPowerW()
//                        )))
//        );
//
//        var kpiPoints = kpiDailyRepository
//                .findByPowerStationAndKpiDateBetweenOrderByKpiDateAsc(station, from.toLocalDate(), to.toLocalDate())
//                .stream()
//                .map(kpi -> new HistoryResponseDto.KpiPoint(
//                        kpi.getKpiDate().toString(),
//                        toDouble(kpi.getPowerKWh()),
//                        toDouble(kpi.getTotalPowerKWh())
//                )).toList();

        return new HistoryResponseDto(powerflow
//                , inverterPoints, kpiPoints
        );
    }

    private Double toDouble(Number value) {
        return value == null ? null : value.doubleValue();
    }
}
