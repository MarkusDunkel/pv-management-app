package com.pvmanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.pvmanagement.config.SemsProperties;
import com.pvmanagement.domain.PowerStation;
import com.pvmanagement.domain.PowerflowSnapshot;
import com.pvmanagement.domain.SemSyncLog;
import com.pvmanagement.repository.PowerStationRepository;
import com.pvmanagement.repository.PowerflowSnapshotRepository;
import com.pvmanagement.repository.SemSyncLogRepository;
import com.pvmanagement.sems.SemsClient;
import com.pvmanagement.sems.exception.AuthorizationExpiredException;
import com.pvmanagement.sems.exception.TransientUpstreamException;
import org.springframework.stereotype.Service;

import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SemSyncService {
    private final SemsClient semsClient;
    private final PowerStationRepository powerStationRepository;
    private final PowerflowSnapshotRepository powerflowSnapshotRepository;
    private final SemSyncLogRepository semSyncLogRepository;

    public SemSyncService(SemsClient semsClient,
                          PowerStationRepository powerStationRepository,
                          PowerflowSnapshotRepository powerflowSnapshotRepository,
                          SemSyncLogRepository semSyncLogRepository,
            SemsProperties properties) {
        this.semsClient = semsClient;
        this.powerStationRepository = powerStationRepository;
        this.powerflowSnapshotRepository = powerflowSnapshotRepository;
        this.semSyncLogRepository = semSyncLogRepository;
    }

    @Retry(name = "semsSync") // exceptions are configured in application.yml
    @Transactional
    public void triggerSync() {
        try {
            JsonNode resp = semsClient.fetchMonitorDetail();

            JsonNode data = resp.path("data");

            // Persist domain data
            JsonNode stationNode = data.path("info");
            var station = persistPowerStation(stationNode);
            persistPowerflowSnapshot(station, data.path("powerflow"));

            recordSync(station, "SUCCESS", null); // consider REQUIRES_NEW inside recordSync

        } catch (AuthorizationExpiredException e) {
            // Non-retryable: let it bubble so Retry won't re-run (configured via YAML)
            throw e;

        } catch (WebClientResponseException.TooManyRequests e) {
            throw new TransientUpstreamException("SEMS API rate limit exceeded (HTTP 429)", e);

        } catch (WebClientResponseException e) {
            // Treat 5xx as transient; 4xx (other than 429) as non-retryable
            if (e.getStatusCode().is5xxServerError()) {
                throw new TransientUpstreamException(
                        "SEMS upstream error " + e.getRawStatusCode() + " " + e.getStatusText(), e
                );
            }
            throw e;
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

    private void recordSync(PowerStation station, String status, String message) {
        var logEntry = new SemSyncLog();
        logEntry.setPowerStation(station);
        logEntry.setStatus(status);
        logEntry.setMessage(message);
        logEntry.setLastSuccessAt(OffsetDateTime.now());
        semSyncLogRepository.save(logEntry);
    }

    private static final Pattern FIRST_NUMBER =
            Pattern.compile("[-+]?\\d{1,3}(?:[\\d.,]*\\d)?");

    public static BigDecimal asBigDecimal(JsonNode node) {
        if (node == null || node.isNull()) return null;

        if (node.isNumber()) {
            return node.decimalValue();
        }

        String text = node.asText(null);
        if (text == null || text.isBlank()) return null;

        Matcher m = FIRST_NUMBER.matcher(text);
        if (!m.find()) return null;

        String num = m.group();

        // Normalize separators:
        boolean hasDot = num.indexOf('.') >= 0;
        boolean hasComma = num.indexOf(',') >= 0;

        if (hasDot && hasComma) {
            // Assume comma is thousands separator, dot is decimal: "1,766.08" -> "1766.08"
            num = num.replace(",", "");
        } else if (hasComma) {
            // Assume comma is decimal separator: "1766,08" -> "1766.08"
            num = num.replace(',', '.');
        }
        // else only dot or neither: leave as-is

        return new BigDecimal(num);
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
        LocalDateTime ldt = LocalDateTime.parse(value.trim(),
                                                FMT);
        // Attach a zero offset (UTC)
        return ldt.atOffset(ZoneOffset.UTC);
    }
}
