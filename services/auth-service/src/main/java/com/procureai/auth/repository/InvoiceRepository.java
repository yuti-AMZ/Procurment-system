package com.procureai.auth.repository;
import com.procureai.auth.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCompanyId(Long companyId);
    List<Invoice> findByStatus(String status);
    long countByStatus(String status);
}
