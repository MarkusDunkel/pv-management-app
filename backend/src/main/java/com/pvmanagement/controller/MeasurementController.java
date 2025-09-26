package com.pvmanagement.controller;

import com.pvmanagement.dto.CurrentMeasurementsDto;
import com.pvmanagement.dto.HistoryRequestDto;
import com.pvmanagement.dto.HistoryResponseDto;
import com.pvmanagement.service.MeasurementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/measurements")
public class MeasurementController {

    private final MeasurementService measurementService;

    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @GetMapping("/current/{powerStationId}")
    public CurrentMeasurementsDto current(@PathVariable Long powerStationId) {
        return measurementService.current(powerStationId);
    }

    @PostMapping("/history/{powerStationId}")
    public HistoryResponseDto history(@PathVariable Long powerStationId,
                                      @Valid @RequestBody HistoryRequestDto request) {
        return measurementService.history(powerStationId, request);
    }
}
