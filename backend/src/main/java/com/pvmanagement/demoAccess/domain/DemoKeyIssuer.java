package com.pvmanagement.demoAccess.domain;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

public final class DemoKeyIssuer {

    private DemoKeyIssuer() {
    }

    public static String issueCompanyKey(String secret, String org, String keyId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofDays(180));
        Algorithm algorithm = Algorithm.HMAC256(secret.getBytes(StandardCharsets.UTF_8));
        return JWT.create()
                .withClaim("org", org)
                .withClaim("key_id", keyId)
                .withClaim("scope", "demo")
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .sign(algorithm);
    }
}
