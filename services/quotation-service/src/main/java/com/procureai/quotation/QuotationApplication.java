package com.procureai.quotation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.procureai.quotation", "com.procureai.common"})
public class QuotationApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuotationApplication.class, args);
    }
}
