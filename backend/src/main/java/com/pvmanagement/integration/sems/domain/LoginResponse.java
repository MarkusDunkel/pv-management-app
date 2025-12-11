package com.pvmanagement.integration.sems.domain;

public record LoginResponse(
        String msg,
        Data data
) {
    public boolean isSuccess() {
        return data != null && data.token() != null && !data.token().isBlank();
    }

    public record Data(
            String uid,
            long timestamp,
            String token,
            String api
    ) {}
}
