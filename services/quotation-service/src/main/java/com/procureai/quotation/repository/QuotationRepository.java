package com.procureai.quotation.repository;

import com.procureai.quotation.entity.Quotation;
import com.procureai.quotation.entity.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    // ── Tenant-safe single-record lookups ────────────────────────────────────
    Optional<Quotation> findByIdAndCompanyId(Long id, Long companyId);

    // ── Tenant-scoped list queries ───────────────────────────────────────────
    List<Quotation> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<Quotation> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, QuotationStatus status);
    List<Quotation> findByCompanyIdAndRfqIdOrderByTotalAmountAsc(Long companyId, Long rfqId);
    List<Quotation> findByCompanyIdAndSupplierIdOrderByCreatedAtDesc(Long companyId, Long supplierId);
    List<Quotation> findByCompanyIdAndRfqIdAndSupplierId(Long companyId, Long rfqId, Long supplierId);
    List<Quotation> findByCompanyIdAndRfqIdAndStatusIn(Long companyId, Long rfqId, List<QuotationStatus> statuses);
}
