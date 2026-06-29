package com.procureai.invoice.producer;

import com.procureai.common.event.InvoiceEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class InvoiceEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public InvoiceEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendInvoiceUploaded(InvoiceEvent event) {
        event.setEventType("INVOICE_UPLOADED");
        event.setSource("invoice-service");
        rabbitTemplate.convertAndSend("invoice.exchange", "invoice.uploaded", event);
    }
}
