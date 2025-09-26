package com.pvmanagement.dto;

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
