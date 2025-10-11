package com.pvmanagement.service;

import com.pvmanagement.domain.RefreshToken;
import com.pvmanagement.dto.AuthResponse;

public record AuthResult(AuthResponse authResponse, RefreshToken refreshToken) {
}
