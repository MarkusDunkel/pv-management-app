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

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "kpi_daily")
@Getter
@Setter
@NoArgsConstructor
public class KpiDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kpi_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "powerstation_id")
    private PowerStation powerStation;

    private LocalDate kpiDate;
    private BigDecimal monthGenerationKWh;
    private BigDecimal pacW;
    private BigDecimal powerKWh;
    private BigDecimal totalPowerKWh;
    private BigDecimal dayIncomeEur;
    private BigDecimal totalIncomeEur;
    private BigDecimal yieldRate;
}
