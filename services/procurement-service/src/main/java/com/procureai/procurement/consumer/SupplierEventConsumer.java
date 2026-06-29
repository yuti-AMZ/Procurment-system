package com.procureai.procurement.consumer;

import com.procureai.common.event.SupplierEvent;
import com.procureai.procurement.entity.PRStatus;
import com.procureai.procurement.entity.PurchaseRequest;
import com.procureai.procurement.exception.BusinessException;
import com.procureai.procurement.repository.PurchaseRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SupplierEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SupplierEventConsumer.class);
    private final PurchaseRequestRepository prRepository;

    public SupplierEventConsumer(PurchaseRequestRepository prRepository) {
        this.prRepository = prRepository;
    }

    @Transactional
    @RabbitListener(queues = "supplier.approved.queue")
    public void handleSupplierApproved(SupplierEvent event) {
        log.info("Supplier approved event: supplierId={}, companyName={}",
                event.getSupplierId(), event.getCompanyName());
    }

    @Transactional
    @RabbitListener(queues = "supplier.approved.queue", id = "pr-auto-assign")
    public void autoAssignSupplierToDraftPRs(SupplierEvent event) {
        if (event.getStatus() == null || !event.getStatus().equals("APPROVED")) return;

        var draftPRs = prRepository.findByStatusOrderByCreatedAtDesc(PRStatus.DRAFT);
        for (PurchaseRequest pr : draftPRs) {
            if (pr.getAssignedSupplierId() == null) {
                pr.setAssignedSupplierId(event.getSupplierId());
                pr.setAssignedSupplierName(event.getCompanyName());
                prRepository.save(pr);
                log.info("Auto-assigned supplier {} to PR {}", event.getSupplierId(), pr.getPrNumber());
            }
        }
    }
}
