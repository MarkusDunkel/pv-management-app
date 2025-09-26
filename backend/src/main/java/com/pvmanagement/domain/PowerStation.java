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
    private Double capacityKWp;
    private Double batteryCapacityKWh;
    private String powerstationType;
    private String status;
    private OffsetDateTime turnonTime;
    private OffsetDateTime createTime;
    private String orgCode;
    private String orgName;
    private Boolean isStored;
    private Boolean isPowerflow;
    private String chartsType;
    private String timeSpan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Owner owner;
}
