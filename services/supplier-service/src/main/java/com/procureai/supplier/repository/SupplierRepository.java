package com.procureai.supplier.repository;

import com.procureai.supplier.entity.Supplier;
import com.procureai.supplier.entity.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByEmail(String email);
    Optional<Supplier> findByRegistrationNumber(String registrationNumber);
    List<Supplier> findByStatus(SupplierStatus status);
    List<Supplier> findByCategory(String category);
    boolean existsByEmail(String email);
    boolean existsByRegistrationNumber(String registrationNumber);
}
