package com.procureai.rfq.repository;

import com.procureai.rfq.entity.Rfq;
import com.procureai.rfq.entity.RfqStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RfqRepository extends JpaRepository<Rfq, Long> {

    // ── Tenant-safe single-record lookups ────────────────────────────────────
    Optional<Rfq> findByIdAndCompanyId(Long id, Long companyId);
    Optional<Rfq> findByRfqNumberAndCompanyId(String rfqNumber, Long companyId);

    // ── Tenant-scoped list queries ───────────────────────────────────────────
    List<Rfq> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<Rfq> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, RfqStatus status);
    List<Rfq> findByCompanyIdAndRequestedByOrderByCreatedAtDesc(Long companyId, String requestedBy);

    // ── Public RFQ queries (for supplier portal — status=OPEN only) ──────────
    // These are intentionally cross-tenant because suppliers browse public RFQs.
    List<Rfq> findByStatusOrderByCreatedAtDesc(RfqStatus status);

    // ── Super-admin / system queries ─────────────────────────────────────────
    List<Rfq> findAllByOrderByCreatedAtDesc();
    List<Rfq> findByRequestedByOrderByCreatedAtDesc(String requestedBy);
}
