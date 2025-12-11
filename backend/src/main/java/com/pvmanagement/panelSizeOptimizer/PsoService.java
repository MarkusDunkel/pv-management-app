package com.pvmanagement.panelSizeOptimizer;

import com.pvmanagement.monitoring.infra.PowerStationRepository;
import com.pvmanagement.monitoring.infra.PowerflowSnapshotRepository;
import com.pvmanagement.timeSeriesStatistics.DayTimeValue;
import com.pvmanagement.timeSeriesStatistics.TimeValue;
import com.pvmanagement.timeSeriesStatistics.TssService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static com.pvmanagement.panelSizeOptimizer.PsoUtils.linearList;

@Service
public class PsoService {

    private final PowerStationRepository powerStationRepository;
    private final PowerflowSnapshotRepository powerflowSnapshotRepository;
    private final TssService tssService;

    public PsoService(PowerStationRepository powerStationRepository, PowerflowSnapshotRepository powerflowSnapshotRepository, TssService tssService) {
        this.powerStationRepository = powerStationRepository;
        this.powerflowSnapshotRepository = powerflowSnapshotRepository;
        this.tssService = tssService;
    }

    public PsoResponse getPanelSizeOptimizationData(Long powerStationId, PsoRequest request) {
        var r = new BigDecimal("1").divide(new BigDecimal(request.reininvesttime()).multiply(new BigDecimal("365"))
                        .multiply(new BigDecimal("24")),
                10,
                RoundingMode.HALF_UP);

        var pvCapacitiesLinear = linearList(100,
                0,
                new BigDecimal("42").doubleValue()).stream()
                .map(BigDecimal::valueOf)
                .toList();

        var pvCapacities = Stream.concat(pvCapacitiesLinear.stream(),
                        Stream.of(new BigDecimal(request.currentCapacity())))
                .distinct()
                .sorted()
                .toList();

        var station = powerStationRepository.findById(powerStationId)
                .orElseThrow(() -> new IllegalArgumentException("Power station not found"));
        OffsetDateTime to = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime from = OffsetDateTime.of(1970,
                1,
                1,
                0,
                0,
                0,
                0,
                ZoneOffset.UTC);
        var history =
                powerflowSnapshotRepository.findByPowerStationAndPowerflowTimestampBetweenOrderByPowerflowTimestampAsc(station,
                        from,
                        to);

        var productionHistory = history.stream()
                .map(snapshot -> new TimeValue(snapshot.getPowerflowTimestamp(),
                        snapshot.getPvW()))
                .toList();

        var consumptionHistory = history.stream()
                .map(snapshot -> new TimeValue(snapshot.getPowerflowTimestamp(),
                        snapshot.getLoadW()))
                .toList();

        List<DayTimeValue> diurnalAggregatedProduction = tssService.computeDiurnalMeanProfile(productionHistory);

        var dailyMeanProduction = diurnalAggregatedProduction.stream()
                .map(DayTimeValue::value)
                .reduce(BigDecimal.ZERO,
                        BigDecimal::add);

        var diurnalProductionProfile = diurnalAggregatedProduction.stream()
                .map(it -> DayTimeValue.builder()
                        .value(it.value()
                                .multiply(new BigDecimal("4")))
                        .timestamp(it.timestamp())
                        .build())
                .toList();

        var efficiencyFactor = dailyMeanProduction.divide(new BigDecimal(request.currentCapacity()).multiply(new BigDecimal("24")),
                6,
                RoundingMode.HALF_UP);

        List<DayTimeValue> diurnalAggregatedConsumption = tssService.computeDiurnalMeanProfile(consumptionHistory);

        var diurnalConsumptionProfile = diurnalAggregatedConsumption.stream()
                .map(it -> DayTimeValue.builder()
                        .value(it.value()
                                .multiply(new BigDecimal("4")))
                        .timestamp(it.timestamp())
                        .build())
                .toList();

        // value-true for intergrating over 15-minutes intervals
        var diurnalAggregatedProductions = pvCapacities.stream()
                .map(targetCapacity -> diurnalAggregatedProduction.stream()
                        .map(it -> DayTimeValue.builder()
                                .timestamp(it.timestamp())
                                .value(it.value()
                                        .multiply(targetCapacity.divide(new BigDecimal(request.currentCapacity()),
                                                10,
                                                RoundingMode.HALF_UP)))
                                .build())
                        .toList())
                .toList();

        var diurnalProductionProfiles = pvCapacities.stream()
                .map(targetCapacity -> diurnalProductionProfile.stream()
                        .map(it -> DayTimeValue.builder()
                                .timestamp(it.timestamp())
                                .value(it.value()
                                        .multiply(targetCapacity.divide(new BigDecimal(request.currentCapacity()),
                                                10,
                                                RoundingMode.HALF_UP)))
                                .build())
                        .toList())
                .toList();

        var fitFactor = new BigDecimal(request.panelcost()).divide(efficiencyFactor,
                        10,
                        RoundingMode.HALF_UP)
                .multiply(r);

        var excessFactor = fitFactor.subtract(new BigDecimal(request.electricitySellingPrice()));

        var lackFactor = new BigDecimal(request.electricityCosts());

        var fits = diurnalAggregatedProductions.stream()
                .map(productionProfile -> {
                    return productionProfile.stream()
                            .map(p -> {

                                var c = diurnalAggregatedConsumption.stream()
                                        .filter(it -> it.timestamp()
                                                .equals(p.timestamp()))
                                        .findFirst()
                                        .orElse(null);
                                if (c == null) {
                                    return null;
                                }
                                if (p.value()
                                        .compareTo(c.value()) >= 0) {
                                    return c.value();
                                }
                                else {
                                    return p.value();
                                }
                            })
                            .toList();
                })
                .toList();

        var totalFits = fits.stream()
                .map(fitProfile -> {
                    return fitProfile.stream()
                            .reduce(BigDecimal.ZERO,
                                    BigDecimal::add);
                })
                .toList();

        List<BigDecimal> fitAmounts = totalFits.stream()
                .map(totalFit -> totalFit.multiply(fitFactor))
                .toList();

        var excesses = diurnalAggregatedProductions.stream()
                .map(productionProfile -> {
                    return productionProfile.stream()
                            .map(p -> {
                                var c = diurnalAggregatedConsumption.stream()
                                        .filter(it -> it.timestamp()
                                                .equals(p.timestamp()))
                                        .findFirst()
                                        .orElse(null);
                                if (c == null) {
                                    return null;
                                }
                                if (p.value()
                                        .compareTo(c.value()) >= 0) {
                                    return p.value()
                                            .subtract(c.value());
                                }
                                else {
                                    return BigDecimal.ZERO;
                                }
                            })
                            .toList();
                })
                .toList();

        var totalExcesses = excesses.stream()
                .map(profile -> profile.stream()
                        .reduce(BigDecimal.ZERO,
                                BigDecimal::add))
                .toList();

        var excessAmounts = totalExcesses.stream()
                .map(totalExcess -> totalExcess.multiply(excessFactor))
                .toList();

        var lacks = diurnalAggregatedProductions.stream()
                .map(profile -> {
                    return profile.stream()
                            .map(p -> {
                                var c = diurnalAggregatedConsumption.stream()
                                        .filter(it -> it.timestamp()
                                                .equals(p.timestamp()))
                                        .findFirst()
                                        .orElse(null);
                                if (c == null) {
                                    return null;
                                }
                                if (p.value()
                                        .compareTo(c.value()) < 0) {
                                    return c.value()
                                            .subtract(p.value());
                                }
                                else {
                                    return BigDecimal.ZERO;
                                }
                            })
                            .toList();
                })
                .toList();

        var totalLacks = lacks.stream()
                .map(profile -> profile.stream()
                        .reduce(BigDecimal.ZERO,
                                BigDecimal::add))
                .toList();

        var lackAmounts = totalLacks.stream()
                .map(val -> val.multiply(lackFactor))
                .toList();

        var totalAmounts = IntStream.range(0,
                        fitAmounts.size())
                .mapToObj(i -> fitAmounts.get(i)
                        .add(excessAmounts.get(i))
                        .add(lackAmounts.get(i)))
                .toList();

        return PsoResponse.builder()
                .diurnalConsumptionProfile(diurnalConsumptionProfile)
                .diurnalProductionProfiles(diurnalProductionProfiles)
                .fitAmounts(fitAmounts)
                .excessAmounts(excessAmounts)
                .lackAmounts(lackAmounts)
                .totalAmounts(totalAmounts)
                .pvCapacities(pvCapacities)
                .request(request)
                .build();
    }


}
