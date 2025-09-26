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
//import java.time.LocalDate;
//
//@Entity
//@Table(name = "weather_forecast")
//@Getter
//@Setter
//@NoArgsConstructor
//public class WeatherForecast {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "forecast_id")
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "powerstation_id")
//    private PowerStation powerStation;
//
//    private LocalDate forecastDate;
//    private String condCodeD;
//    private String condCodeN;
//    private String condTxtD;
//    private String condTxtN;
//    private Integer hum;
//    private Integer pop;
//    private Double pcpn;
//    private Double pres;
//    private Double tmpMax;
//    private Double tmpMin;
//    private Integer uvIndex;
//    private Integer vis;
//    private Integer windDeg;
//    private String windDir;
//    private String windSc;
//    private Double windSpd;
//}
