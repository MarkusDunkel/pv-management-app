package com.pvmanagement.controller;

import com.pvmanagement.config.JwtProperties;
import com.pvmanagement.domain.RefreshToken;
import com.pvmanagement.dto.AuthRequest;
import com.pvmanagement.dto.AuthResponse;
import com.pvmanagement.dto.RegisterRequest;
import com.pvmanagement.dto.UserProfileDto;
import com.pvmanagement.service.AuthResult;
import com.pvmanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;

@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    public AuthController(AuthService authService, JwtProperties jwtProperties) {
        this.authService = authService;
        this.jwtProperties = jwtProperties;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        var result = authService.register(request);
        return respondWithTokens(result);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        var result = authService.login(request);
        return respondWithTokens(result);
    }

    @GetMapping("/me")
    public UserProfileDto profile(@AuthenticationPrincipal UserDetails principal) {
        return authService.profile(principal.getUsername());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                    .build();
        }
        try {
            var result = authService.refresh(refreshToken);
            return respondWithTokens(result);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                        .build();
            }
            throw ex;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = REFRESH_TOKEN_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .build();
    }

    private ResponseEntity<AuthResponse> respondWithTokens(AuthResult result) {
        var cookie = buildRefreshCookie(result.refreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result.authResponse());
    }

    private ResponseCookie buildRefreshCookie(RefreshToken refreshToken) {
        Duration maxAge = Duration.between(Instant.now(), refreshToken.getExpiresAt());
        long maxAgeSeconds = Math.max(0, maxAge.getSeconds());
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken.getToken())
                .httpOnly(true)
                .secure(jwtProperties.isRefreshTokenCookieSecure())
                .path("/api/auth")
                .sameSite("None")
                .maxAge(maxAgeSeconds)
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(jwtProperties.isRefreshTokenCookieSecure())
                .path("/api/auth")
                .sameSite("None")
                .maxAge(0)
                .build();
    }
}
