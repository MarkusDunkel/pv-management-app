package com.pvmanagement.demo;

import java.time.Instant;

public record DemoClaims(String org, String keyId, String scope, Instant issuedAt, Instant expiresAt) {
}
