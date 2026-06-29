package com.procureai.procurement.consumer;

import com.procureai.common.event.QuotationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class QuotationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(QuotationEventConsumer.class);

    @RabbitListener(queues = "quotation.submitted.queue")
    public void handleQuotationSubmitted(QuotationEvent event) {
        log.info("Quotation submitted: quotationId={}, supplier={}, amount={}",
                event.getQuotationId(), event.getSupplierName(), event.getTotalAmount());

        if (event.getTotalAmount() != null
                && event.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
            log.info("Quotation {} is competitive for evaluation", event.getQuotationNumber());
        }
    }
}
