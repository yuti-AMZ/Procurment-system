package com.procureai.supplier.producer;

import com.procureai.common.event.NotificationEvent;
import com.procureai.common.event.SupplierEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class SupplierEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public SupplierEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendSupplierRegistered(SupplierEvent event) {
        event.setEventType("SUPPLIER_REGISTERED");
        event.setSource("supplier-service");
        rabbitTemplate.convertAndSend("supplier.exchange", "supplier.registered", event);
        sendNotification(event, "New Supplier Registered: " + event.getCompanyName());
    }

    public void sendSupplierApproved(SupplierEvent event) {
        event.setEventType("SUPPLIER_APPROVED");
        event.setSource("supplier-service");
        rabbitTemplate.convertAndSend("supplier.exchange", "supplier.approved", event);
        sendNotification(event, "Supplier Approved: " + event.getCompanyName());
    }

    public void sendSupplierRejected(SupplierEvent event) {
        event.setEventType("SUPPLIER_REJECTED");
        event.setSource("supplier-service");
        rabbitTemplate.convertAndSend("supplier.exchange", "supplier.rejected", event);
        sendNotification(event, "Supplier Rejected: " + event.getCompanyName());
    }

    private void sendNotification(SupplierEvent event, String title) {
        NotificationEvent notification = new NotificationEvent("NOTIFICATION", "supplier-service");
        notification.setTitle(title);
        notification.setMessage("Supplier " + event.getCompanyName() + " status: " + event.getStatus());
        notification.setNotificationType("SUPPLIER_STATUS");
        rabbitTemplate.convertAndSend("notification.exchange", "notification.supplier", notification);
    }
}
