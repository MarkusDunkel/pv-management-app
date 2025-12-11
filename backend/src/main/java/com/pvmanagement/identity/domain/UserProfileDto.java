package com.pvmanagement.identity.domain;

import java.time.OffsetDateTime;
import java.util.Set;

public record UserProfileDto(
        Long id,
        String email,
        String displayName,
        boolean enabled,
        boolean emailVerified,
        OffsetDateTime createdAt,
        Set<String> roles
) {
}
