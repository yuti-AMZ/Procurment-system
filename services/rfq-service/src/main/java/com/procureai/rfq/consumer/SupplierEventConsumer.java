package com.procureai.rfq.consumer;

import com.procureai.common.event.SupplierEvent;
import com.procureai.rfq.entity.Rfq;
import com.procureai.rfq.entity.RfqStatus;
import com.procureai.rfq.repository.RfqRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SupplierEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SupplierEventConsumer.class);
    private final RfqRepository rfqRepository;

    public SupplierEventConsumer(RfqRepository rfqRepository) {
        this.rfqRepository = rfqRepository;
    }

    @Transactional
    @RabbitListener(queues = "supplier.approved.queue")
    public void handleSupplierApproved(SupplierEvent event) {
        log.info("Supplier approved for RFQ: supplierId={}, companyName={}",
                event.getSupplierId(), event.getCompanyName());

        var draftRfqs = rfqRepository.findByStatusOrderByCreatedAtDesc(RfqStatus.DRAFT);
        for (Rfq rfq : draftRfqs) {
            boolean alreadyInvited = rfq.getInvitedSuppliers().stream()
                    .anyMatch(s -> s.getSupplierId().equals(event.getSupplierId()));
            if (!alreadyInvited && event.getCategory() != null) {
                boolean categoryMatches = rfq.getLineItems().stream()
                        .anyMatch(item -> event.getCategory().equalsIgnoreCase(item.getCategory()));
                if (categoryMatches) {
                    com.procureai.rfq.entity.RfqSupplier rs = new com.procureai.rfq.entity.RfqSupplier();
                    rs.setSupplierId(event.getSupplierId());
                    rs.setSupplierName(event.getCompanyName());
                    rs.setRfq(rfq);
                    rfq.getInvitedSuppliers().add(rs);
                    rfqRepository.save(rfq);
                    log.info("Auto-invited supplier {} to RFQ {}", event.getCompanyName(), rfq.getRfqNumber());
                }
            }
        }
    }
}
