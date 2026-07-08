package com.procureai.invoice.repository;

import com.procureai.invoice.entity.Invoice;
import com.procureai.invoice.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // ── Tenant-safe single-record lookups ────────────────────────────────────
    Optional<Invoice> findByIdAndCompanyId(Long id, Long companyId);

    // ── Tenant-scoped duplicate check ────────────────────────────────────────
    boolean existsByInvoiceNumberAndCompanyId(String invoiceNumber, Long companyId);

    // ── Tenant-scoped list queries ───────────────────────────────────────────
    List<Invoice> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<Invoice> findByCompanyIdAndStatus(Long companyId, InvoiceStatus status);
    List<Invoice> findByCompanyIdAndPoId(Long companyId, Long poId);
    List<Invoice> findByCompanyIdAndSupplierId(Long companyId, Long supplierId);

    // ── Platform-level / super-admin queries ─────────────────────────────────
    boolean existsByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByPoId(Long poId);
    List<Invoice> findBySupplierId(Long supplierId);
    List<Invoice> findByStatus(InvoiceStatus status);
}
