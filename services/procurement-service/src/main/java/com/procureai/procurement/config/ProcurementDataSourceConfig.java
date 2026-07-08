package com.procureai.procurement.config;

import javax.sql.DataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import jakarta.persistence.EntityManagerFactory;
import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import java.util.Map;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.procureai.procurement.repository",
        entityManagerFactoryRef = "procurementEntityManagerFactory",
        transactionManagerRef = "procurementTransactionManager"
)
public class ProcurementDataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties procurementDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource procurementDataSource() {
        return procurementDataSourceProperties().initializeDataSourceBuilder().build();
    }

    @Bean
    @Primary
    public LocalContainerEntityManagerFactoryBean procurementEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @jakarta.annotation.Nullable @org.springframework.beans.factory.annotation.Qualifier("procurementDataSource") DataSource procurementDataSource) {
        return builder
                .dataSource(procurementDataSource)
                .packages("com.procureai.procurement.entity")
                .persistenceUnit("procurement")
                .properties(Map.of(
                        "hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect",
                        "hibernate.hbm2ddl.auto", "update",
                        "hibernate.default_schema", "public",
                        "hibernate.physical_naming_strategy", CamelCaseToUnderscoresNamingStrategy.class.getName()
                ))
                .build();
    }

    @Bean
    @Primary
    public PlatformTransactionManager procurementTransactionManager(
            @org.springframework.beans.factory.annotation.Qualifier("procurementEntityManagerFactory") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}
