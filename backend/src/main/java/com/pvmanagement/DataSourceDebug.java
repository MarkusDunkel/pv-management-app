package com.pvmanagement;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DataSourceDebug {

    private final DataSource dataSource;

    public DataSourceDebug(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void log() throws Exception {
        try (Connection c = dataSource.getConnection()) {
            System.out.println(">>> MAIN DS URL = " + c.getMetaData().getURL());
            System.out.println(">>> MAIN DS USER = " + c.getMetaData().getUserName());
        }
    }
}
