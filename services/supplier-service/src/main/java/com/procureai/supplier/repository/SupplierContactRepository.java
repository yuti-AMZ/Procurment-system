package com.procureai.supplier.repository;

import com.procureai.supplier.entity.SupplierContact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierContactRepository extends JpaRepository<SupplierContact, Long> {
    List<SupplierContact> findBySupplierProfileId(Long supplierProfileId);
}
