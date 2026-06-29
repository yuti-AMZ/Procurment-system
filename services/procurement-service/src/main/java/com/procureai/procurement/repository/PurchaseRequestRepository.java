package com.procureai.procurement.repository;

import com.procureai.procurement.entity.PRStatus;
import com.procureai.procurement.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    List<PurchaseRequest> findByStatusOrderByCreatedAtDesc(PRStatus status);
    List<PurchaseRequest> findAllByOrderByCreatedAtDesc();
    List<PurchaseRequest> findByRequestedByOrderByCreatedAtDesc(String requestedBy);
}
