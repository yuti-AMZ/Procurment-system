package com.procureai.procurement.repository;

import com.procureai.procurement.entity.POStatus;
import com.procureai.procurement.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
    List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(POStatus status);
    Optional<PurchaseOrder> findByPurchaseRequestId(Long purchaseRequestId);
}
