package com.procureai.supplier.repository;

import com.procureai.supplier.entity.SupplierStatus;
import com.procureai.supplier.entity.TenantSupplierRelationship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TenantSupplierRelationshipRepository extends JpaRepository<TenantSupplierRelationship, Long> {

    Optional<TenantSupplierRelationship> findBySupplierProfileIdAndCompanyId(Long supplierProfileId, Long companyId);
    List<TenantSupplierRelationship> findByCompanyId(Long companyId);
    List<TenantSupplierRelationship> findByCompanyIdAndStatus(Long companyId, SupplierStatus status);
    List<TenantSupplierRelationship> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<TenantSupplierRelationship> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, SupplierStatus status);
    boolean existsBySupplierProfileIdAndCompanyId(Long supplierProfileId, Long companyId);
    long countByCompanyIdAndStatus(Long companyId, SupplierStatus status);
}
