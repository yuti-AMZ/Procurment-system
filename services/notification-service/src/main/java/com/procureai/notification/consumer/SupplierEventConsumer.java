package com.procureai.notification.consumer;

import com.procureai.common.event.SupplierEvent;
import com.procureai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class SupplierEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SupplierEventConsumer.class);
    private final NotificationService notificationService;

    public SupplierEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.supplier.queue")
    public void handleSupplierEvent(SupplierEvent event) {
        log.info("Supplier event: type={}, company={}", event.getEventType(), event.getCompanyName());

        String title;
        String message;

        switch (event.getEventType()) {
            case "SUPPLIER_REGISTERED" -> {
                title = "Supplier Registered";
                message = event.getCompanyName() + " has registered";
            }
            case "SUPPLIER_APPROVED" -> {
                title = "Supplier Approved";
                message = event.getCompanyName() + " has been approved";
            }
            case "SUPPLIER_REJECTED" -> {
                title = "Supplier Rejected";
                message = event.getCompanyName() + " has been rejected";
            }
            default -> {
                title = "Supplier Update";
                message = "Update on " + event.getCompanyName() + ": " + event.getEventType();
            }
        }

        notificationService.createNotification(
                null, event.getEmail(), title, message,
                "SUPPLIER_" + event.getEventType(), "/suppliers/" + event.getSupplierId(),
                "supplier-service"
        );
    }
}
