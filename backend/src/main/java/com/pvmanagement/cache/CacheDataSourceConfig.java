package com.pvmanagement.cache;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Configuration
@EnableConfigurationProperties(CacheDataSourceProperties.class)
public class CacheDataSourceConfig {

    @Bean
    @ConfigurationProperties("cache.datasource")
    public DataSource cacheDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    public JdbcTemplate cacheJdbcTemplate(@Qualifier("cacheDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
