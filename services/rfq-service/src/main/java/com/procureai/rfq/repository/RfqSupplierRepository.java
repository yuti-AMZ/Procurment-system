package com.procureai.rfq.repository;

import com.procureai.rfq.entity.RfqSupplier;
import com.procureai.rfq.entity.SupplierResponseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RfqSupplierRepository extends JpaRepository<RfqSupplier, Long> {
    List<RfqSupplier> findByRfqId(Long rfqId);
    List<RfqSupplier> findBySupplierIdAndResponseStatus(Long supplierId, SupplierResponseStatus status);
}
