package com.procureai.quotation.producer;

import com.procureai.common.event.QuotationEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class QuotationEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public QuotationEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendQuotationSubmitted(QuotationEvent event) {
        event.setEventType("QUOTATION_SUBMITTED");
        event.setSource("quotation-service");
        rabbitTemplate.convertAndSend("quotation.exchange", "quotation.submitted", event);
    }
}
