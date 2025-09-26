package com.pvmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
        @Email(message = "Invalid email address") String email,
        @NotBlank(message = "Password is required") String password
) {
}
