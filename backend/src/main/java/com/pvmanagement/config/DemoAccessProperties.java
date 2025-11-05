package com.pvmanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.demo")
public class DemoAccessProperties {

    private String secret;
    private int sessionMaxAgeHours;
    private int defaultMaxActivations;
    private int keyValidDays;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public int getSessionMaxAgeHours() {
        return sessionMaxAgeHours;
    }

    public void setSessionMaxAgeHours(int sessionMaxAgeHours) {
        this.sessionMaxAgeHours = sessionMaxAgeHours;
    }

    public int getDefaultMaxActivations() {
        return defaultMaxActivations;
    }

    public void setDefaultMaxActivations(int defaultMaxActivations) {
        this.defaultMaxActivations = defaultMaxActivations;
    }

    public int getKeyValidDays() {
        return keyValidDays;
    }

    public void setKeyValidDays(int keyValidDays) {
        this.keyValidDays = keyValidDays;
    }
}
