package com.pvmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
//import com.pvmanagement.domain.Inverter;
//import com.pvmanagement.domain.KpiDaily;
//import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.domain.PowerflowSnapshot;
import com.pvmanagement.domain.SemSyncLog;
//import com.pvmanagement.repository.InverterRepository;
//import com.pvmanagement.repository.KpiDailyRepository;
import com.pvmanagement.repository.PowerStationRepository;
import com.pvmanagement.repository.PowerflowSnapshotRepository;
import com.pvmanagement.repository.SemSyncLogRepository;
import com.pvmanagement.sems.SemsClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;

@Service
public class SemSyncService {

    private static final Logger log = LoggerFactory.getLogger(SemSyncService.class);

    private final SemsClient semsClient;
    private final PowerStationRepository powerStationRepository;
    private final PowerflowSnapshotRepository powerflowSnapshotRepository;
//    private final KpiDailyRepository kpiDailyRepository;
//    private final InverterRepository inverterRepository;
    private final SemSyncLogRepository semSyncLogRepository;

    public SemSyncService(SemsClient semsClient,
                          PowerStationRepository powerStationRepository,
                          PowerflowSnapshotRepository powerflowSnapshotRepository,
//                          KpiDailyRepository kpiDailyRepository,
//                          InverterRepository inverterRepository,
                          SemSyncLogRepository semSyncLogRepository) {
        this.semsClient = semsClient;
        this.powerStationRepository = powerStationRepository;
        this.powerflowSnapshotRepository = powerflowSnapshotRepository;
//        this.kpiDailyRepository = kpiDailyRepository;
//        this.inverterRepository = inverterRepository;
        this.semSyncLogRepository = semSyncLogRepository;
    }

    @Transactional
    @Retry(name = "semsSync", fallbackMethod = "handleSyncFailure")
    public void triggerSync() {
        PowerStation station = null;
        try {
            JsonNode response = semsClient.fetchMonitorDetail();
            var data = response.path("data");
            if (data.isMissingNode()) {
                throw new IllegalStateException("SEMS response missing data node");
            }
            var stationNode = data.path("info");
            station = persistPowerStation(stationNode);
            persistPowerflowSnapshot(station, data.path("powerflow"));
//            persistKpi(station, data.path("kpi"));
//            persistInverters(station, data.path("inverter"));
            recordSync(station, "SUCCESS", null);
        } catch (Exception ex) {
            log.error("SEMS sync failed", ex);
            recordSync(station, "FAILED", ex.getMessage());
            throw new IllegalStateException("SEMS sync failed", ex);
        }
    }

    private PowerStation persistPowerStation(JsonNode stationNode) {
        if (stationNode.isMissingNode()) {
            throw new IllegalStateException("SEMS stationData missing");
        }
        String stationName = stationNode.path("stationname").asText();
        var station = powerStationRepository.findByStationname(stationName).orElseGet(PowerStation::new);
        station.setStationname(stationName);
        station.setAddress(stationNode.path("address").asText(null));
        station.setLatitude(stationNode.path("latitude").isNumber() ? stationNode.path("latitude").asDouble() : null);
        station.setLongitude(stationNode.path("longitude").isNumber() ? stationNode.path("longitude").asDouble() : null);
        station.setCapacityKWp(asDouble(stationNode.path("capacity_kWp")));
        station.setBatteryCapacityKWh(asDouble(stationNode.path("battery_capacity_kWh")));
        station.setPowerstationType(stationNode.path("powerstation_type").asText(null));
        station.setStatus(stationNode.path("status").asText(null));
        station.setOrgName(stationNode.path("org_name").asText(null));
        station.setOrgCode(stationNode.path("org_code").asText(null));
        station.setChartsType(stationNode.path("charts_type").asText(null));
        station.setTimeSpan(stationNode.path("time_span").asText(null));
        station.setIsPowerflow(stationNode.path("is_powerflow").asBoolean());
        station.setIsStored(stationNode.path("is_stored").asBoolean());
        if (stationNode.hasNonNull("turnon_time")) {
            station.setTurnonTime(parseOffset(stationNode.path("turnon_time").asText()));
        }
        if (stationNode.hasNonNull("create_time")) {
            station.setCreateTime(parseOffset(stationNode.path("create_time").asText()));
        }
        return powerStationRepository.save(station);
    }

    private void persistPowerflowSnapshot(PowerStation station, JsonNode powerflowNode) {
        if (powerflowNode.isMissingNode()) {
            return;
        }
        var snapshot = new PowerflowSnapshot();
        snapshot.setPowerStation(station);
        snapshot.setPowerflowTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        snapshot.setPvW(asBigDecimal(powerflowNode.path("pv")));
        snapshot.setBatteryW(asBigDecimal(powerflowNode.path("bettery")));
        snapshot.setLoadW(asBigDecimal(powerflowNode.path("load")));
        snapshot.setGridW(asBigDecimal(powerflowNode.path("grid")));
        snapshot.setGensetW(asBigDecimal(powerflowNode.path("genset")));
        snapshot.setMicrogridW(asBigDecimal(powerflowNode.path("microgrid")));
        snapshot.setSocPercent(asBigDecimal(powerflowNode.path("soc")));
        snapshot.setPvStatus(powerflowNode.path("pvStatus").asText(null));
        snapshot.setBatteryStatus(powerflowNode.path("betteryStatus").asText(null));
        snapshot.setLoadStatus(powerflowNode.path("loadStatus").asText(null));
        snapshot.setGridStatus(powerflowNode.path("gridStatus").asText(null));
        powerflowSnapshotRepository.save(snapshot);
    }

//    private void persistKpi(PowerStation station, JsonNode kpiNode) {
//        if (kpiNode.isMissingNode()) {
//            return;
//        }
//        var today = java.time.LocalDate.now();
//        var daily = kpiDailyRepository.findByPowerStationAndKpiDate(station, today)
//                .orElseGet(() -> {
//                    var entity = new KpiDaily();
//                    entity.setPowerStation(station);
//                    entity.setKpiDate(today);
//                    return entity;
//                });
//
//        daily.setMonthGenerationKWh(asBigDecimal(kpiNode.path("month_generation_kWh")));
//        daily.setPowerKWh(asBigDecimal(kpiNode.path("power_kWh")));
//        daily.setTotalPowerKWh(asBigDecimal(kpiNode.path("total_power_kWh")));
//        daily.setPacW(asBigDecimal(kpiNode.path("pac_W")));
//        daily.setYieldRate(asBigDecimal(kpiNode.path("yield_rate")));
//        daily.setDayIncomeEur(asBigDecimal(kpiNode.path("day_income_EUR")));
//        daily.setTotalIncomeEur(asBigDecimal(kpiNode.path("total_income_EUR")));
//        kpiDailyRepository.save(daily);
//    }

//    private void persistInverters(PowerStation station, JsonNode invertersNode) {
//        if (invertersNode.isMissingNode() || !invertersNode.isArray()) {
//            return;
//        }
//        Iterator<JsonNode> iterator = invertersNode.elements();
//        while (iterator.hasNext()) {
//            JsonNode node = iterator.next();
//            String sn = node.path("sn").asText(null);
//            if (sn == null) {
//                continue;
//            }
//            Inverter inverter = inverterRepository.findById(sn).orElseGet(Inverter::new);
//            inverter.setSerialNumber(sn);
//            inverter.setPowerStation(station);
//            inverter.setRelationId(node.path("relation_id").asText(null));
//            inverter.setName(node.path("name").asText(null));
//            inverter.setStatus(node.path("status").asText(null));
//            inverter.setPacW(asDouble(node.path("pac_W")));
//            inverter.setEtotalKWh(asDouble(node.path("etotal_kWh")));
//            inverter.setEdayKWh(asDouble(node.path("eday_kWh")));
//            inverter.setTemperatureC(asDouble(node.path("temperature_C")));
//            inverter.setSocPercent(asDouble(node.path("soc_percent")));
//            inverter.setSohPercent(asDouble(node.path("soh_percent")));
//            inverterRepository.save(inverter);
//        }
//    }

    private void handleSyncFailure(Exception ex) {
        log.error("SEMS sync failed after retries", ex);
        throw new IllegalStateException("SEMS sync failed after retries", ex);
    }

    private void recordSync(PowerStation station, String status, String message) {
        var logEntry = new SemSyncLog();
        logEntry.setPowerStation(station);
        logEntry.setStatus(status);
        logEntry.setMessage(message);
        logEntry.setLastSuccessAt(OffsetDateTime.now());
        semSyncLogRepository.save(logEntry);
    }

    private BigDecimal asBigDecimal(JsonNode node) {
        if (node == null || node.isMissingNode() || !node.isNumber()) {
            return null;
        }
        return node.decimalValue();
    }

    private Double asDouble(JsonNode node) {
        if (node == null || node.isMissingNode() || !node.isNumber()) {
            return null;
        }
        return node.doubleValue();
    }

    private OffsetDateTime parseOffset(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
//        return OffsetDateTime.parse(value, formatter);
        LocalDateTime ldt = LocalDateTime.parse(value.trim(),
                                                FMT);
        // Attach a zero offset (UTC)
        return ldt.atOffset(ZoneOffset.UTC);
    }
}
