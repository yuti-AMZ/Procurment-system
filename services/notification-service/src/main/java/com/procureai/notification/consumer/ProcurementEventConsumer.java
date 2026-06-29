package com.procureai.notification.consumer;

import com.procureai.common.event.ProcurementEvent;
import com.procureai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ProcurementEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ProcurementEventConsumer.class);
    private final NotificationService notificationService;

    public ProcurementEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.procurement.queue")
    public void handleProcurementEvent(ProcurementEvent event) {
        log.info("Procurement event: type={}, prNumber={}", event.getEventType(), event.getPrNumber());

        String title;
        String message;
        String type = event.getEventType();

        switch (type) {
            case "PR_CREATED" -> {
                title = "Purchase Request Created";
                message = "PR " + event.getPrNumber() + " for $" + event.getTotalAmount()
                        + " has been created by " + event.getRequestedBy();
            }
            case "PR_APPROVED" -> {
                title = "Purchase Request Approved";
                message = "PR " + event.getPrNumber() + " for $" + event.getTotalAmount()
                        + " has been approved";
            }
            case "PO_GENERATED" -> {
                title = "Purchase Order Generated";
                message = "PO " + event.getPoNumber() + " has been generated from PR "
                        + event.getPrNumber() + " for $" + event.getTotalAmount();
            }
            default -> {
                title = "Procurement Update";
                message = "Update on " + event.getPrNumber() + ": " + type;
            }
        }

        notificationService.createNotification(
                event.getRequestedBy(),
                null,
                title,
                message,
                "PROCUREMENT_" + type,
                "/procurement/pr/" + event.getPrId(),
                "procurement-service"
        );
    }
}
