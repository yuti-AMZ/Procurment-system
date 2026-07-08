package com.procureai.supplier.consumer;

import com.procureai.common.event.NotificationEvent;
import com.procureai.common.event.RfqEvent;
import com.procureai.supplier.entity.SupplierProfile;
import com.procureai.supplier.entity.SupplierStatus;
import com.procureai.supplier.entity.TenantSupplierRelationship;
import com.procureai.supplier.repository.SupplierProfileRepository;
import com.procureai.supplier.repository.TenantSupplierRelationshipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RfqEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(RfqEventConsumer.class);

    private final SupplierProfileRepository profileRepository;
    private final TenantSupplierRelationshipRepository relationshipRepository;
    private final RabbitTemplate rabbitTemplate;

    public RfqEventConsumer(SupplierProfileRepository profileRepository,
                            TenantSupplierRelationshipRepository relationshipRepository,
                            RabbitTemplate rabbitTemplate) {
        this.profileRepository = profileRepository;
        this.relationshipRepository = relationshipRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = "rfq.published.queue")
    public void handleRfqPublished(RfqEvent event) {
        log.info("RFQ published: rfqId={}, title={}. Notifying approved suppliers...",
                event.getRfqId(), event.getTitle());

        List<TenantSupplierRelationship> relationships =
                relationshipRepository.findByCompanyIdAndStatus(event.getCompanyId(), SupplierStatus.APPROVED);

        for (TenantSupplierRelationship rel : relationships) {
            SupplierProfile profile = profileRepository.findById(rel.getSupplierProfileId()).orElse(null);
            if (profile == null) continue;

            NotificationEvent notification = new NotificationEvent("NOTIFICATION", "supplier-service");
            notification.setCompanyId(event.getCompanyId());
            notification.setRecipientEmail(profile.getEmail());
            notification.setTitle("New RFQ: " + event.getTitle());
            notification.setMessage("A new request for quotation has been published: "
                    + event.getTitle() + ". Deadline: " + event.getDeadline());
            notification.setNotificationType("RFQ_NOTIFICATION");
            notification.setMetadata(java.util.Map.of(
                    "rfqId", event.getRfqId(),
                    "supplierId", profile.getId()
            ));
            rabbitTemplate.convertAndSend("notification.exchange", "notification.rfq", notification);

            log.info("Notified supplier: {} ({})", profile.getCompanyName(), profile.getEmail());
        }
    }
}
