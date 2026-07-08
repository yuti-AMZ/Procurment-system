package com.procureai.rfq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.procureai.rfq", "com.procureai.common"})
public class RfqApplication {
    public static void main(String[] args) {
        SpringApplication.run(RfqApplication.class, args);
    }
}
