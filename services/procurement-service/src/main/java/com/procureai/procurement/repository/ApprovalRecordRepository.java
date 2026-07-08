package com.procureai.procurement.repository;

import com.procureai.procurement.entity.ApprovalRecord;
import com.procureai.procurement.entity.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApprovalRecordRepository extends JpaRepository<ApprovalRecord, Long> {
    List<ApprovalRecord> findByPurchaseRequestIdOrderByStepOrderAsc(Long purchaseRequestId);
    long countByPurchaseRequestIdAndStatus(Long purchaseRequestId, ApprovalStatus status);
    List<ApprovalRecord> findByPurchaseRequestIdAndCompanyIdOrderByStepOrderAsc(Long purchaseRequestId, Long companyId);
}
