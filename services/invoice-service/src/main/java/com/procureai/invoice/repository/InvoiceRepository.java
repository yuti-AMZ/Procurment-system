package com.procureai.invoice.repository;

import com.procureai.invoice.entity.Invoice;
import com.procureai.invoice.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPoId(Long poId);
    List<Invoice> findBySupplierId(Long supplierId);
    List<Invoice> findByStatus(InvoiceStatus status);
    boolean existsByInvoiceNumber(String invoiceNumber);
}
