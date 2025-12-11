package com.pvmanagement.auth.web;

import com.pvmanagement.auth.domain.AuthRequest;
import com.pvmanagement.auth.domain.AuthResponse;
import com.pvmanagement.auth.domain.RegisterRequest;
import com.pvmanagement.demoAccess.app.DemoAccessService;
import com.pvmanagement.demoAccess.app.DemoRateLimiter;
import com.pvmanagement.demoAccess.domain.DemoAccessException;
import com.pvmanagement.demoAccess.domain.DemoKeyIssuer;
import com.pvmanagement.identity.domain.UserProfileDto;
import com.pvmanagement.auth.domain.AuthResult;
import com.pvmanagement.auth.app.AuthService;
import com.pvmanagement.auth.app.AuthCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${app.demo.secret}")
    private String secret;

    private final AuthService authService;
    private final AuthCookieService authCookieService;
    private final DemoAccessService demoAccessService;
    private final DemoRateLimiter rateLimiter;

    public AuthController(AuthService authService, AuthCookieService authCookieService, DemoAccessService demoAccessService, DemoRateLimiter rateLimiter) {
        this.authService = authService;
        this.authCookieService = authCookieService;
        this.demoAccessService = demoAccessService;
        this.rateLimiter = rateLimiter;
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

    @GetMapping("/demo-login/{slug}")
    public ResponseEntity<AuthResponse> issue(@PathVariable String slug, HttpServletRequest request) {
        var keyId = demoAccessService.findTokenDetails(slug);

        if (keyId.isEmpty()) {
            throw new DemoAccessException("Demo key is unknown.");
        }
        String jwt = DemoKeyIssuer.issueCompanyKey(secret,
                                                   keyId.get()
                                                        .getOrg(),
                                                   keyId.get()
                                                        .getKeyId());

        String clientIp = resolveClientIp(request);
        if (!rateLimiter.tryConsume(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                                 .build();
        }

        String userAgent = Optional.ofNullable(request.getHeader("User-Agent"))
                                   .orElse("unknown");
        AuthResult result = demoAccessService.redeem(jwt,
                                                     clientIp,
                                                     userAgent);

        var cookie = authCookieService.buildRefreshCookie(result.refreshToken());
        return ResponseEntity.ok()
                             .header(HttpHeaders.SET_COOKIE,
                                     cookie.toString())
                             .body(result.authResponse());
    }


    @GetMapping("/me")
    public UserProfileDto profile(@AuthenticationPrincipal UserDetails principal) {
        return authService.profile(principal.getUsername());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = AuthCookieService.COOKIE_NAME, required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .header(HttpHeaders.SET_COOKIE,
                                         authCookieService.clearRefreshCookie()
                                                          .toString())
                                 .build();
        }
        try {
            var result = authService.refresh(refreshToken);
            return respondWithTokens(result);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                     .header(HttpHeaders.SET_COOKIE,
                                             authCookieService.clearRefreshCookie()
                                                              .toString())
                                     .build();
            }
            throw ex;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = AuthCookieService.COOKIE_NAME, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                             .header(HttpHeaders.SET_COOKIE,
                                     authCookieService.clearRefreshCookie()
                                                      .toString())
                             .build();
    }

    private ResponseEntity<AuthResponse> respondWithTokens(AuthResult result) {
        var cookie = authCookieService.buildRefreshCookie(result.refreshToken());
        return ResponseEntity.ok()
                             .header(HttpHeaders.SET_COOKIE,
                                     cookie.toString())
                             .body(result.authResponse());
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
