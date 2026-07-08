package com.procureai.procurement.repository;

import com.procureai.procurement.entity.POStatus;
import com.procureai.procurement.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    // ── Tenant-safe single-record lookups ────────────────────────────────────
    Optional<PurchaseOrder> findByIdAndCompanyId(Long id, Long companyId);
    Optional<PurchaseOrder> findByPurchaseRequestIdAndCompanyId(Long purchaseRequestId, Long companyId);

    // ── Tenant-scoped list queries ───────────────────────────────────────────
    List<PurchaseOrder> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<PurchaseOrder> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, POStatus status);

    // ── Super-admin / system queries ─────────────────────────────────────────
    Optional<PurchaseOrder> findByPurchaseRequestId(Long purchaseRequestId);
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
    List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(POStatus status);
}
