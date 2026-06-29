package com.procureai.supplier.repository;

import com.procureai.supplier.entity.SupplierDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierDocumentRepository extends JpaRepository<SupplierDocument, Long> {
    List<SupplierDocument> findBySupplierId(Long supplierId);
}
