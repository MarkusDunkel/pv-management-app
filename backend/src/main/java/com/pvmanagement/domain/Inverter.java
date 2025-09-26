package com.pvmanagement.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "inverter")
@Getter
@Setter
@NoArgsConstructor
public class Inverter {

    @Id
    @Column(name = "sn")
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "powerstation_id")
    private PowerStation powerStation;

    private String relationId;
    private String name;
    private String type;
    private Double capacityKW;
    private OffsetDateTime turnonTime;
    private String firmwareVersion;
    private String status;
    private Double temperatureC;
    private Double pacW;
    private Double etotalKWh;
    private Double edayKWh;
    private Double emonthKWh;
    private Double socPercent;
    private Double sohPercent;
    private String checkCode;
}
