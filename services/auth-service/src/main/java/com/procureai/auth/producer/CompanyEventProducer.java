package com.procureai.auth.producer;

import com.procureai.common.event.CompanyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class CompanyEventProducer {

    private static final Logger log = LoggerFactory.getLogger(CompanyEventProducer.class);
    private final RabbitTemplate rabbitTemplate;

    public CompanyEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendCompanyApproved(CompanyEvent event) {
        event.setSource("auth-service");
        rabbitTemplate.convertAndSend("auth.exchange", "auth.company.approved", event);
        log.info("Published COMPANY_APPROVED event for company: {}", event.getCompanyName());
    }

    public void sendCompanyRejected(CompanyEvent event) {
        event.setSource("auth-service");
        rabbitTemplate.convertAndSend("auth.exchange", "auth.company.rejected", event);
        log.info("Published COMPANY_REJECTED event for company: {}", event.getCompanyName());
    }
}
