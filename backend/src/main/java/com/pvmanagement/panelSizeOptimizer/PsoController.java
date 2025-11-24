package com.pvmanagement.panelSizeOptimizer;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/powerstations/")
public class PsoController {
    private final PsoService psoService;

    public PsoController(PsoService psoService) {
        this.psoService = psoService;
    }

    @PostMapping("/{id}/optimizations")
    public PsoResponse getOptimizations(@PathVariable Long id, @RequestBody PsoRequest request) {
       return psoService.getPanelSizeOptimizationData(id, request);
    }

}
