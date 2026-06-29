package com.procureai.notification.consumer;

import com.procureai.common.event.RfqEvent;
import com.procureai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RfqEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(RfqEventConsumer.class);
    private final NotificationService notificationService;

    public RfqEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.rfq.queue")
    public void handleRfqEvent(RfqEvent event) {
        log.info("RFQ event: type={}, rfqNumber={}", event.getEventType(), event.getRfqNumber());

        String title;
        String message;
        String type = event.getEventType();

        switch (type) {
            case "RFQ_CREATED" -> {
                title = "RFQ Created";
                message = "RFQ " + event.getRfqNumber() + ": " + event.getTitle()
                        + " has been created, deadline: " + event.getDeadline();
            }
            case "RFQ_PUBLISHED" -> {
                title = "RFQ Published";
                message = "RFQ " + event.getRfqNumber() + ": " + event.getTitle()
                        + " has been published to " + (event.getSupplierIds() != null ? event.getSupplierIds().size() : 0) + " suppliers";
            }
            default -> {
                title = "RFQ Update";
                message = "Update on " + event.getRfqNumber() + ": " + type;
            }
        }

        notificationService.createNotification(
                null, null, title, message,
                "RFQ_" + type, "/rfq/" + event.getRfqId(),
                "rfq-service"
        );
    }
}
