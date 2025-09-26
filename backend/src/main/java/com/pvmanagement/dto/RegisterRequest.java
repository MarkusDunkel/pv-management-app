package com.pvmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email(message = "Invalid email address") String email,
        @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters") String password,
        @NotBlank(message = "Display name is required") String displayName
) {
}
