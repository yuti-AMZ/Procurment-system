package com.procureai.procurement.repository;

import com.procureai.procurement.entity.PRStatus;
import com.procureai.procurement.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {

    // ── Tenant-safe single-record lookups ────────────────────────────────────
    // Always prefer these over plain findById() to guarantee tenant isolation.
    Optional<PurchaseRequest> findByIdAndCompanyId(Long id, Long companyId);
    Optional<PurchaseRequest> findByPrNumberAndCompanyId(String prNumber, Long companyId);

    // ── Tenant-scoped list queries (use these in service layer) ──────────────
    List<PurchaseRequest> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<PurchaseRequest> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, PRStatus status);
    List<PurchaseRequest> findByCompanyIdAndRequestedByOrderByCreatedAtDesc(Long companyId, String requestedBy);

    // ── Super-admin / system queries (MUST check caller has SUPER_ADMIN role) ─
    // These bypass tenant filtering and are only safe for platform-wide ops.
    List<PurchaseRequest> findByStatusOrderByCreatedAtDesc(PRStatus status);
    List<PurchaseRequest> findAllByOrderByCreatedAtDesc();
    List<PurchaseRequest> findByRequestedByOrderByCreatedAtDesc(String requestedBy);

    // ── Usage limit queries ──────────────────────────────────────────────────
    long countByCompanyIdAndCreatedAtAfter(Long companyId, LocalDateTime since);
}
