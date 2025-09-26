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
import java.time.OffsetDateTime;

@Entity
@Table(name = "powerflow_snapshot")
@Getter
@Setter
@NoArgsConstructor
public class PowerflowSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "powerflow_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "powerstation_id")
    private PowerStation powerStation;

    private OffsetDateTime timestamp;
    private BigDecimal pvW;
    private String pvStatus;
    private BigDecimal batteryW;
    private String batteryStatus;
    private BigDecimal loadW;
    private String loadStatus;
    private BigDecimal gridW;
    private String gridStatus;
    private BigDecimal gensetW;
    private BigDecimal microgridW;
    private BigDecimal socPercent;
}
