package com.pvmanagement.demo;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.pvmanagement.config.DemoAccessProperties;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class DemoTokenService {

    private final JWTVerifier verifier;

    public DemoTokenService(DemoAccessProperties properties) {
        Algorithm algorithm = Algorithm.HMAC256(properties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.verifier = JWT.require(algorithm).build();
    }

    public DemoClaims parseAndValidate(String token) {
        try {
            DecodedJWT decoded = verifier.verify(token);
            String org = decoded.getClaim("org").asString();
            String keyId = decoded.getClaim("key_id").asString();
            String scope = decoded.getClaim("scope").asString();

            if (org == null || keyId == null) {
                throw new DemoAccessException("Demo token missing required claims");
            }

            return new DemoClaims(org,
                    keyId,
                    scope,
                    decoded.getIssuedAt() != null ? decoded.getIssuedAt().toInstant() : null,
                    decoded.getExpiresAt() != null ? decoded.getExpiresAt().toInstant() : null);
        } catch (Exception ex) {
            throw new DemoAccessException("Invalid demo token");
        }
    }
}
