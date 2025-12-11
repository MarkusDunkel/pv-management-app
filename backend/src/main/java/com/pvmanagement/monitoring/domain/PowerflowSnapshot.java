package com.pvmanagement.monitoring.domain;

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

    @Column(name = "powerflow_timestamp")
    private OffsetDateTime powerflowTimestamp;
    @Column(name = "pv_w")
    private BigDecimal pvW;
    @Column(name = "pv_status")
    private String pvStatus;
    @Column(name = "battery_w")
    private BigDecimal batteryW;
    @Column(name = "battery_status")
    private String batteryStatus;
    @Column(name = "load_w")
    private BigDecimal loadW;
    @Column(name = "load_status")
    private String loadStatus;
    @Column(name = "grid_w")
    private BigDecimal gridW;
    @Column(name = "grid_status")
    private String gridStatus;
    @Column(name = "genset_w")
    private BigDecimal gensetW;
    @Column(name = "microgrid_w")
    private BigDecimal microgridW;
    @Column(name = "soc_percent")
    private BigDecimal socPercent;
}
