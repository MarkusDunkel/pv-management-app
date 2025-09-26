package com.pvmanagement.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "energy_statistics_totals")
@Getter
@Setter
@NoArgsConstructor
public class EnergyStatisticsTotals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "totals_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "powerstation_id")
    private PowerStation powerStation;

    private Double contributingRate;
    private Double selfUseRate;
    private Double sumKWh;
    private Double buyKWh;
    private Double buyPercent;
    private Double sellKWh;
    private Double sellPercent;
    private Double selfUseOfPvKWh;
    private Double consumptionOfLoadKWh;
    private Double chargeKWh;
    private Double dischargeKWh;
    private Double gensetGenKWh;
    private Double microgridGenKWh;
}
