package com.procureai.invoice.consumer;

import com.procureai.common.event.ProcurementEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ProcurementEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ProcurementEventConsumer.class);

    @RabbitListener(queues = "po.generated.queue")
    public void handlePoGenerated(ProcurementEvent event) {
        log.info("PO generated for invoicing: poId={}, poNumber={}, amount={}",
                event.getPoId(), event.getPoNumber(), event.getTotalAmount());
    }
}
