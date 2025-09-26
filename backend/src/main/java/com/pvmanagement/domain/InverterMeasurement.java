//package com.pvmanagement.domain;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.Entity;
//import jakarta.persistence.FetchType;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
//import jakarta.persistence.ManyToOne;
//import jakarta.persistence.Table;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import lombok.Setter;
//
//import java.time.OffsetDateTime;
//
//@Entity
//@Table(name = "inverter_measurement")
//@Getter
//@Setter
//@NoArgsConstructor
//public class InverterMeasurement {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "meas_id")
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "sn")
//    private Inverter inverter;
//
//    private OffsetDateTime timestamp;
//    private Double outputPowerW;
//    private Double outputCurrentA;
//    private Double outputVoltageV;
//    private Double dcInput1VA;
//    private Double dcInput2VA;
//    private Double batteryVoltageV;
//    private Double batteryCurrentA;
//    private Double batteryPowerW;
//    private String workMode;
//    private String gridConnStatus;
//    private String backupOutputs;
//    private Double meterPhaseR;
//    private Double meterPhaseS;
//    private Double meterPhaseT;
//}
