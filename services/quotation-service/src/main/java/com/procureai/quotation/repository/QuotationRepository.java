package com.procureai.quotation.repository;

import com.procureai.quotation.entity.Quotation;
import com.procureai.quotation.entity.QuotationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    List<Quotation> findAllByOrderByCreatedAtDesc();
    List<Quotation> findByRfqIdOrderByTotalAmountAsc(Long rfqId);
    List<Quotation> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
    List<Quotation> findByRfqIdAndSupplierId(Long rfqId, Long supplierId);
    List<Quotation> findByStatusOrderByCreatedAtDesc(QuotationStatus status);
    List<Quotation> findByRfqIdAndStatusIn(Long rfqId, List<QuotationStatus> statuses);
}
