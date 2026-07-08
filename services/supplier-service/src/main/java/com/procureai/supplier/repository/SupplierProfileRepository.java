package com.procureai.supplier.repository;

import com.procureai.supplier.entity.SupplierProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierProfileRepository extends JpaRepository<SupplierProfile, Long> {

    boolean existsByEmail(String email);
    boolean existsByRegistrationNumber(String registrationNumber);
    Optional<SupplierProfile> findByEmail(String email);
    Optional<SupplierProfile> findByRegistrationNumber(String registrationNumber);
    List<SupplierProfile> findByCategory(String category);
    List<SupplierProfile> findByIdIn(List<Long> ids);
}
