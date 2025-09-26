package com.pvmanagement.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.pvmanagement.config.JwtProperties;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Set;

@Component
public class JwtService {

    private final JwtProperties properties;
    private final Algorithm algorithm;
    private final JWTVerifier verifier;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.algorithm = Algorithm.HMAC256(properties.getSecret());
        this.verifier = JWT.require(algorithm).withIssuer("pv-management").build();
    }

    public String generateToken(String subject, Set<String> roles, Map<String, String> claims) {
        Instant expiresAt = Instant.now().plusSeconds(properties.getAccessTokenTtlSeconds());
        var jwtBuilder = JWT.create()
                .withIssuer("pv-management")
                .withSubject(subject)
                .withExpiresAt(Date.from(expiresAt))
                .withIssuedAt(new Date())
                .withClaim("roles", roles.stream().sorted().toList());

        if (claims != null) {
            claims.forEach(jwtBuilder::withClaim);
        }

        return jwtBuilder.sign(algorithm);
    }

    public DecodedJWT verify(String token) {
        return verifier.verify(token);
    }

    public Instant extractExpiry(String token) {
        return verify(token).getExpiresAt().toInstant();
    }
}
