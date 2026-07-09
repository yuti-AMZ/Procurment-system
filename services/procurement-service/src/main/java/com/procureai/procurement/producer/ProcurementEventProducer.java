package com.procureai.procurement.producer;

import com.procureai.common.event.ProcurementEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProcurementEventProducer {

    private static final Logger log = LoggerFactory.getLogger(ProcurementEventProducer.class);

    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;

    public void sendPrCreated(ProcurementEvent event) {
        if (rabbitTemplate == null) { log.warn("RabbitMQ not available, skipping PR_CREATED event"); return; }
        try {
            event.setEventType("PR_CREATED");
            event.setSource("procurement-service");
            rabbitTemplate.convertAndSend("procurement.exchange", "procurement.pr.created", event);
        } catch (Exception e) {
            log.warn("Failed to send PR_CREATED event: {}", e.getMessage());
        }
    }

    public void sendPrApproved(ProcurementEvent event) {
        if (rabbitTemplate == null) { log.warn("RabbitMQ not available, skipping PR_APPROVED event"); return; }
        try {
            event.setEventType("PR_APPROVED");
            event.setSource("procurement-service");
            rabbitTemplate.convertAndSend("procurement.exchange", "procurement.pr.approved", event);
        } catch (Exception e) {
            log.warn("Failed to send PR_APPROVED event: {}", e.getMessage());
        }
    }

    public void sendPoGenerated(ProcurementEvent event) {
        if (rabbitTemplate == null) { log.warn("RabbitMQ not available, skipping PO_GENERATED event"); return; }
        try {
            event.setEventType("PO_GENERATED");
            event.setSource("procurement-service");
            rabbitTemplate.convertAndSend("procurement.exchange", "procurement.po.generated", event);
        } catch (Exception e) {
            log.warn("Failed to send PO_GENERATED event: {}", e.getMessage());
        }
    }
}
