package com.pvmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank(message = "Display name is required") String displayName
) {
}
