package com.procureai.notification.consumer;

import com.procureai.common.event.InvoiceEvent;
import com.procureai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class InvoiceEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(InvoiceEventConsumer.class);
    private final NotificationService notificationService;

    public InvoiceEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.invoice.queue")
    public void handleInvoiceEvent(InvoiceEvent event) {
        log.info("Invoice event: type={}, invoiceNumber={}", event.getEventType(), event.getInvoiceNumber());

        String title;
        String message;

        switch (event.getEventType()) {
            case "INVOICE_UPLOADED" -> {
                title = "Invoice Uploaded";
                message = "Invoice " + event.getInvoiceNumber()
                        + " for $" + event.getAmount() + " has been uploaded";
            }
            case "INVOICE_APPROVED" -> {
                title = "Invoice Approved";
                message = "Invoice " + event.getInvoiceNumber() + " has been approved";
            }
            case "INVOICE_REJECTED" -> {
                title = "Invoice Rejected";
                message = "Invoice " + event.getInvoiceNumber() + " has been rejected";
            }
            default -> {
                title = "Invoice Update";
                message = "Update on " + event.getInvoiceNumber() + ": " + event.getEventType();
            }
        }

        notificationService.createNotification(
                null, null, title, message,
                "INVOICE_" + event.getEventType(), "/invoices/" + event.getInvoiceId(),
                "invoice-service"
        );
    }
}
