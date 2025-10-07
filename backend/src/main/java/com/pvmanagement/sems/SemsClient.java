package com.pvmanagement.sems;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pvmanagement.config.SemsProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class SemsClient {

    private static final Logger log = LoggerFactory.getLogger(SemsClient.class);

    private final WebClient webClient;
    private final SemsProperties properties;
    private final ObjectMapper objectMapper;

    private final AtomicReference<SemsToken> cachedToken = new AtomicReference<>();

    public SemsClient(SemsProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public JsonNode fetchMonitorDetail() {
        ensureToken();

        var token = cachedToken.get();
        if (token == null) {
            throw new IllegalStateException("Failed to obtain SEMS token");
        }

        String tokenHeader = token.toHeaderValue();
        return webClient.post()
                .uri("/PowerStation/GetMonitorDetailByPowerstationId")
                .header("token", tokenHeader)
                .body(BodyInserters.fromValue(Map.of("powerStationId", properties.getStationId())))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(15))
                .block();
    }

    private void ensureToken() {
        var existing = cachedToken.get();
        if (existing != null && existing.expiresAt().isAfter(Instant.now().plusSeconds(60))) {
            return;
        }
        cachedToken.set(login());
    }

    private SemsToken login() {
        var body = Map.of(
                "account", properties.getAccount(),
                "pwd", properties.getPassword()
        );

        var response = webClient.post()
                .uri("/Common/CrossLogin")
                .header("Token", tokenMetadataHeader())
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(10))
                .blockOptional()
                .orElseThrow(() -> new IllegalStateException("SEMS login returned empty response"));

        var data = response.path("data");
        if (data.isMissingNode()) {
            throw new IllegalStateException("Unexpected SEMS login response: " + response);
        }
        return new SemsToken(
                data.path("uid").asText(),
                data.path("timestamp").asLong(),
                data.path("token").asText(),
                Instant.now().plus(Duration.ofMinutes(30))
        );
    }

    private String tokenMetadataHeader() {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "version", properties.getVersion(),
                    "client", properties.getClient(),
                    "language", properties.getLanguage()
            ));
        } catch (Exception e) {
            log.error("Failed to serialize SEMS token metadata", e);
            throw new IllegalStateException("Failed to serialize SEMS token metadata", e);
        }
    }

    private record SemsToken(String uid, long timestamp, String token, Instant expiresAt) {
        public String toHeaderValue() {
            return "{\"uid\":\"" + uid + "\",\"timestamp\":" + timestamp +
                    ",\"token\":\"" + token + "\",\"client\":\"ios\",\"version\":\"v2.1.0\",\"ver\":\"v2.1.0\",\"language\":\"en\"}";
        }
    }
}
