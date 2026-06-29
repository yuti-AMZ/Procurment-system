package com.procureai.notification.consumer;

import com.procureai.common.event.QuotationEvent;
import com.procureai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class QuotationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(QuotationEventConsumer.class);
    private final NotificationService notificationService;

    public QuotationEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.quotation.queue")
    public void handleQuotationEvent(QuotationEvent event) {
        log.info("Quotation event: type={}, quotationNumber={}, supplier={}",
                event.getEventType(), event.getQuotationNumber(), event.getSupplierName());

        if (!"QUOTATION_SUBMITTED".equals(event.getEventType())) return;

        String title = "Quotation Submitted";
        String message = "Quotation " + event.getQuotationNumber()
                + " submitted by " + event.getSupplierName()
                + " for $" + event.getTotalAmount();

        notificationService.createNotification(
                null, null, title, message,
                "QUOTATION_SUBMITTED", "/quotation/" + event.getQuotationId(),
                "quotation-service"
        );
    }
}
