package com.pvmanagement.auth.app;

import com.pvmanagement.auth.domain.RefreshToken;
import com.pvmanagement.auth.domain.JwtProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class AuthCookieService {

    public static final String COOKIE_NAME = "refreshToken";

    private final JwtProperties jwtProperties;

    public AuthCookieService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String getCookieName() {
        return COOKIE_NAME;
    }

    public ResponseCookie buildRefreshCookie(RefreshToken refreshToken) {
        Duration maxAge = Duration.between(Instant.now(),
                                           refreshToken.getExpiresAt());
        long maxAgeSeconds = Math.max(0,
                                      maxAge.getSeconds());
        return ResponseCookie.from(COOKIE_NAME,
                                   refreshToken.getToken())
                             .httpOnly(true)
                             .secure(jwtProperties.isRefreshTokenCookieSecure())
                             .path("/api/auth")
                             .sameSite("None")
                             .maxAge(maxAgeSeconds)
                             .build();
    }

    public ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(COOKIE_NAME,
                                   "")
                             .httpOnly(true)
                             .secure(jwtProperties.isRefreshTokenCookieSecure())
                             .path("/api/auth")
                             .sameSite("None")
                             .maxAge(0)
                             .build();
    }
}
