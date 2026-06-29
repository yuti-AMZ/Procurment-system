package com.procureai.procurement.producer;

import com.procureai.common.event.ProcurementEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProcurementEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public ProcurementEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendPrCreated(ProcurementEvent event) {
        event.setEventType("PR_CREATED");
        event.setSource("procurement-service");
        rabbitTemplate.convertAndSend("procurement.exchange", "procurement.pr.created", event);
    }

    public void sendPrApproved(ProcurementEvent event) {
        event.setEventType("PR_APPROVED");
        event.setSource("procurement-service");
        rabbitTemplate.convertAndSend("procurement.exchange", "procurement.pr.approved", event);
    }

    public void sendPoGenerated(ProcurementEvent event) {
        event.setEventType("PO_GENERATED");
        event.setSource("procurement-service");
        rabbitTemplate.convertAndSend("procurement.exchange", "procurement.po.generated", event);
    }
}
