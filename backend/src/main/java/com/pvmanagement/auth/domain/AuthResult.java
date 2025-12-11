package com.pvmanagement.auth.domain;

public record AuthResult(AuthResponse authResponse, RefreshToken refreshToken) {
}
