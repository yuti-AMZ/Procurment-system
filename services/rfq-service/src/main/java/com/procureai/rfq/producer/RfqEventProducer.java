package com.procureai.rfq.producer;

import com.procureai.common.event.RfqEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class RfqEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public RfqEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendRfqCreated(RfqEvent event) {
        event.setEventType("RFQ_CREATED");
        event.setSource("rfq-service");
        rabbitTemplate.convertAndSend("rfq.exchange", "rfq.created", event);
    }

    public void sendRfqPublished(RfqEvent event) {
        event.setEventType("RFQ_PUBLISHED");
        event.setSource("rfq-service");
        rabbitTemplate.convertAndSend("rfq.exchange", "rfq.published", event);
    }
}
