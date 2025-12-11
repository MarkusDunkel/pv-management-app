package com.pvmanagement.monitoring.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "powerstation")
@Getter
@Setter
@NoArgsConstructor
public class PowerStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "powerstation_id")
    private Long id;

    private String stationname;
    private String address;
    private Double latitude;
    private Double longitude;

    @Column(name = "capacity_k_wp")
    private Double capacityKWp;

    @Column(name = "battery_capacity_k_wh")
    private Double batteryCapacityKWh;

    @Column(name = "powerstation_type")
    private String powerstationType;

    private String status;

    @Column(name = "turnon_time")
    private OffsetDateTime turnonTime;

    @Column(name = "create_time")
    private OffsetDateTime createTime;

    @Column(name = "org_code")
    private String orgCode;

    @Column(name = "org_name")
    private String orgName;

    @Column(name = "is_stored")
    private Boolean isStored;

    @Column(name = "is_powerflow")
    private Boolean isPowerflow;

    @Column(name = "charts_type")
    private String chartsType;

    @Column(name = "time_span")
    private String timeSpan;

}
