package com.pvmanagement.sems;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.stubbing.Scenario;
import com.pvmanagement.config.SemsProperties;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.web.reactive.function.client.WebClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

class SemsAuthExpiredTests {

    private WireMockServer wm;
    private SemsAuthService auth;
    private SemsClient semsClient;
    private final ObjectMapper mapper = new ObjectMapper();
    private SemsProperties props;

    @BeforeEach
    void setup() {
        wm = new WireMockServer(0);
        wm.start();
        configureFor("localhost", wm.port());

        props = new SemsProperties();
        props.setBaseUrl("http://localhost:" + wm.port() + "/api/v2");
        props.setAccount("user@example.com");
        props.setPassword("secret");
        props.setClient("ios");
        props.setVersion("v2.1.0");
        props.setLanguage("en");
        props.setStationId("123456");

        WebClient.Builder authBuilder = WebClient.builder();
        auth = new SemsAuthService(props.getBaseUrl(), mapper, authBuilder, props);
        SemsClientConfig config = new SemsClientConfig();
        WebClient.Builder clientBuilder = WebClient.builder();
        WebClient webClient = config.semsWebClient(clientBuilder, props.getBaseUrl(), auth, mapper);
        semsClient = new SemsClient(webClient, props);
    }

    @AfterEach
    void teardown() {
        wm.stop();
    }

    @Test
    void refresh_on_200_body_expired_then_succeeds() {
        stubLoginSuccess();
        stubLoginSuccess();
        stubDataOnceExpiredThenOk();

        var json = semsClient.fetchMonitorDetail();
        Assertions.assertEquals("Test PV", json.path("data").path("info").path("stationname").asText());

        wm.verify(2, postRequestedFor(urlPathEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .withHeader("token", matching(".+")));
        wm.verify(2, postRequestedFor(urlPathEqualTo("/api/v2/Common/CrossLogin")));
    }

    @Test
    void refresh_on_401_then_succeeds() {
        stubLoginSuccess();
        stubLoginSuccess();
        stubData401ThenOk();

        var json = semsClient.fetchMonitorDetail();
        Assertions.assertEquals("Test PV", json.path("data").path("info").path("stationname").asText());

        wm.verify(2, postRequestedFor(urlPathEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId")));
        wm.verify(2, postRequestedFor(urlPathEqualTo("/api/v2/Common/CrossLogin")));
    }

    @Test
    void guard_prevents_infinite_retry_when_still_expired() {
        stubLoginSuccess();
        stubLoginSuccess();
        stubDataExpiredForever();

        var json = semsClient.fetchMonitorDetail();
        Assertions.assertTrue(json.path("msg").asText().toLowerCase().contains("expired"));

        wm.verify(2, postRequestedFor(urlPathEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId")));
        wm.verify(2, postRequestedFor(urlPathEqualTo("/api/v2/Common/CrossLogin")));
    }

    @Test
    void login_failure_bubbles_up() {
        wm.stubFor(post(urlEqualTo("/api/v2/Common/CrossLogin"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"msg\":\"Failed\",\"data\":{}}")));

        Assertions.assertThrows(IllegalStateException.class, () -> semsClient.fetchMonitorDetail());
        wm.verify(1, postRequestedFor(urlPathEqualTo("/api/v2/Common/CrossLogin")));
    }

    @Test
    void token_header_is_sent_on_data_calls() {
        stubLoginSuccess();
        wm.stubFor(post(urlEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .withHeader("token", matching(".+")  )
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"msg\":\"OK\",\"data\":{\"info\":{\"stationname\":\"Test PV\"},\"powerflow\":{}}}")));

        var json = semsClient.fetchMonitorDetail();
        Assertions.assertEquals("Test PV", json.path("data").path("info").path("stationname").asText());
        wm.verify(1, postRequestedFor(urlPathEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .withHeader("token", matching(".+"))   );
    }

    private void stubLoginSuccess() {
        wm.stubFor(post(urlEqualTo("/api/v2/Common/CrossLogin"))
                .withHeader("token", matching(".+"))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"msg\":\"Successful\",\"data\":{\"uid\":\"U1\",\"timestamp\":1700000000,\"token\":\"T1\",\"api\":\"v2.1.0\"}}")));
    }

    private void stubDataOnceExpiredThenOk() {
        wm.stubFor(post(urlEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .inScenario("expired-then-ok")
                .whenScenarioStateIs(Scenario.STARTED)
                .withRequestBody(containing("\"powerStationId\""))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"msg\":\"The authorization has expired, please log in again.\",\"data\":{}}"))
                .willSetStateTo("ok"));

        wm.stubFor(post(urlEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .inScenario("expired-then-ok")
                .whenScenarioStateIs("ok")
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"msg\":\"OK\",\"data\":{\"info\":{\"stationname\":\"Test PV\"},\"powerflow\":{\"pv\":\"1234\"}}}")));
    }

    private void stubData401ThenOk() {
        wm.stubFor(post(urlEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .inScenario("401-then-ok")
                .whenScenarioStateIs(Scenario.STARTED)
                .willReturn(aResponse().withStatus(401))
                .willSetStateTo("ok"));

        wm.stubFor(post(urlEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .inScenario("401-then-ok")
                .whenScenarioStateIs("ok")
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"msg\":\"OK\",\"data\":{\"info\":{\"stationname\":\"Test PV\"},\"powerflow\":{\"pv\":\"42\"}}}")));
    }

    private void stubDataExpiredForever() {
        wm.stubFor(post(urlEqualTo("/api/v2/PowerStation/GetMonitorDetailByPowerstationId"))
                .withRequestBody(containing("\"powerStationId\""))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"msg\":\"The authorization has expired, please log in again.\",\"data\":{}}")));
    }
}
