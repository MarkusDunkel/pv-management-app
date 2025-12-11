package com.pvmanagement.monitoring.web;

import com.pvmanagement.monitoring.domain.DashboardSummaryDto;
import com.pvmanagement.monitoring.domain.PowerStationDto;
import com.pvmanagement.monitoring.app.PowerStationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/powerstations")
public class PowerStationController {

    private final PowerStationService powerStationService;

    public PowerStationController(PowerStationService powerStationService) {
        this.powerStationService = powerStationService;
    }

    @GetMapping
    public List<PowerStationDto> list() {
        return powerStationService.listPowerStations();
    }

    @GetMapping("/{id}")
    public PowerStationDto get(@PathVariable Long id) {
        return powerStationService.getPowerStation(id);
    }

    @GetMapping("/{id}/dashboard")
    public DashboardSummaryDto dashboard(@PathVariable Long id) {
        return powerStationService.buildDashboard(id);
    }
}
