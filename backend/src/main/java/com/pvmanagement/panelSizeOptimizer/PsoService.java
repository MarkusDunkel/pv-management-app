package com.pvmanagement.panelSizeOptimizer;

import com.pvmanagement.repository.PowerStationRepository;
import com.pvmanagement.repository.PowerflowSnapshotRepository;
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
        var electricityCosts = new BigDecimal("0.36"); // (€/kWh)
        var electricitySellingPrice = new BigDecimal("0.10"); // (€/kWh)
        var currentCapacity = new BigDecimal("7000"); // W
        var performanceRatio = 0.8;
        var reininvesttime = 25; // years
        var panelcost = 1.6; // €/W

        var pvCapacities = linearList(20,
                currentCapacity.doubleValue() / 3,
                currentCapacity.intValue() * 6).stream()
                .map(val -> BigDecimal.valueOf(Math.round(val)))
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

        var pvProduction = history.stream()
                .map(snapshot -> new TimeValue(snapshot.getPowerflowTimestamp(),
                        snapshot.getPvW()))
                .toList();

        var consumption = history.stream()
                .map(snapshot -> new TimeValue(snapshot.getPowerflowTimestamp(),
                        snapshot.getLoadW()))
                .toList();

        List<DayTimeValue> diurnalAggregatedPvProduction = tssService.computeDiurnalMeanProfile(pvProduction);
        List<DayTimeValue> diurnalAggregatedConsumption = tssService.computeDiurnalMeanProfile(consumption);

        var diurnalAggregatedPvProductions = pvCapacities.stream()
                .map(targetCapacity -> diurnalAggregatedPvProduction.stream()
                        .map(it -> DayTimeValue.builder()
                                .timestamp(it.timestamp())
                                .value(it.value()
                                        .multiply(targetCapacity.divide(currentCapacity,
                                                2,
                                                RoundingMode.HALF_UP)))
                                .build())
                        .toList())
                .toList();

        var fitFactors = pvCapacities.stream()
                .map(size -> BigDecimal.valueOf(electricityCosts.doubleValue() -
                        size.doubleValue() * panelcost * performanceRatio / (reininvesttime * 8760))).toList();

        var excessFactors = pvCapacities.stream()
                .map(size -> BigDecimal.valueOf(electricitySellingPrice.doubleValue() -
                        size.doubleValue() * panelcost * performanceRatio / (reininvesttime * 8760)))
                .toList();

        var lackFactor = BigDecimal.valueOf(electricityCosts.doubleValue());

        var fits = diurnalAggregatedPvProductions.stream()
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
                        }

                )
                .toList();

        var THOUSAND = BigDecimal.valueOf(1000);

        List<BigDecimal> fitAmounts = IntStream.range(0, totalFits.size())
                .mapToObj(i -> totalFits.get(i)
                        .divide(THOUSAND, 2, RoundingMode.HALF_UP)
                        .multiply(fitFactors.get(i)))
                .toList();

        var excesses = diurnalAggregatedPvProductions.stream()
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

        var excessAmounts = IntStream.range(0,
                        totalExcesses.size())
                .mapToObj(i -> totalExcesses.get(i)
                        .divide(THOUSAND,
                                2,
                                RoundingMode.HALF_UP)
                        .multiply(excessFactors.get(i)))
                .toList();

        var lacks = diurnalAggregatedPvProductions.stream()
                .map(
                        profile -> {
                            return profile.stream()
                                    .map(p ->
                                    {
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
                        }).toList();

        var totalLacks = lacks.stream()
                .map(profile -> profile.stream()
                        .reduce(BigDecimal.ZERO,
                                BigDecimal::add))
                .toList();

        var lackAmounts = totalLacks.stream()
                .map(val -> val.divide(THOUSAND,
                                2,
                                RoundingMode.HALF_UP)
                        .multiply(lackFactor))
                .toList();

        var totalAmounts = IntStream.range(0,
                        fitAmounts.size())
                .mapToObj(i -> fitAmounts.get(i)
                        .add(excessAmounts.get(i))
                        .add(lackAmounts.get(i)))
                .toList();

        PsoResponse result = PsoResponse.builder()
                .diurnalAggregatedConsumption(diurnalAggregatedConsumption)
                .diurnalAggregatedPvProductions(diurnalAggregatedPvProductions)
                .fitAmounts(fitAmounts)
                .excessAmounts(excessAmounts)
                .lackAmounts(lackAmounts)
                .totalAmounts(totalAmounts)
                .pvCapacities(pvCapacities)
                .build();

        return result;

    }


}
