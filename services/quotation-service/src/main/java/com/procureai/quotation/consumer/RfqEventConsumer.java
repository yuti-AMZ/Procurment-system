package com.procureai.quotation.consumer;

import com.procureai.common.event.RfqEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class RfqEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(RfqEventConsumer.class);

    @RabbitListener(queues = "rfq.published.queue")
    public void handleRfqPublished(RfqEvent event) {
        log.info("RFQ published: rfqId={}, title={}, deadline={}, suppliers={}",
                event.getRfqId(), event.getTitle(), event.getDeadline(), event.getSupplierIds());

        if (event.getSupplierIds() != null) {
            log.info("Awaiting quotations from {} suppliers for RFQ {}",
                    event.getSupplierIds().size(), event.getRfqNumber());
        }
    }
}
