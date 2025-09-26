package com.pvmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PvManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(PvManagementApplication.class, args);
    }
}
