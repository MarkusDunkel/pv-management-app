package com.pvmanagement.auth.domain;

import java.time.Instant;
import java.util.Set;

public record AuthResponse(
        String token,
        Instant expiresAt,
        Set<String> roles,
        String displayName,
        String email
) {
}
