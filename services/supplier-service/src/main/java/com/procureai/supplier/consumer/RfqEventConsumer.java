package com.procureai.supplier.consumer;

import com.procureai.common.event.NotificationEvent;
import com.procureai.common.event.RfqEvent;
import com.procureai.supplier.entity.Supplier;
import com.procureai.supplier.entity.SupplierStatus;
import com.procureai.supplier.repository.SupplierRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RfqEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(RfqEventConsumer.class);

    private final SupplierRepository supplierRepository;
    private final RabbitTemplate rabbitTemplate;

    public RfqEventConsumer(SupplierRepository supplierRepository, RabbitTemplate rabbitTemplate) {
        this.supplierRepository = supplierRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = "rfq.published.queue")
    public void handleRfqPublished(RfqEvent event) {
        log.info("RFQ published: rfqId={}, title={}. Notifying approved suppliers...",
                event.getRfqId(), event.getTitle());

        List<Supplier> approvedSuppliers = supplierRepository.findByStatus(SupplierStatus.APPROVED);

        for (Supplier supplier : approvedSuppliers) {
            NotificationEvent notification = new NotificationEvent("NOTIFICATION", "supplier-service");
            notification.setRecipientEmail(supplier.getEmail());
            notification.setTitle("New RFQ: " + event.getTitle());
            notification.setMessage("A new request for quotation has been published: "
                    + event.getTitle() + ". Deadline: " + event.getDeadline());
            notification.setNotificationType("RFQ_NOTIFICATION");
            notification.setMetadata(java.util.Map.of(
                    "rfqId", event.getRfqId(),
                    "supplierId", supplier.getId()
            ));
            rabbitTemplate.convertAndSend("notification.exchange", "notification.rfq", notification);

            log.info("Notified supplier: {} ({})", supplier.getCompanyName(), supplier.getEmail());
        }
    }
}
