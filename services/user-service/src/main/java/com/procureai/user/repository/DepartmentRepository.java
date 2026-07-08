package com.procureai.user.repository;

import com.procureai.user.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // ── Tenant-safe single-record lookups ────────────────────────────────────
    Optional<Department> findByIdAndCompanyId(Long id, Long companyId);

    // ── Tenant-scoped queries ─────────────────────────────────────────────────
    List<Department> findByCompanyIdOrderByNameAsc(Long companyId);

    // ── Tenant-scoped duplicate check ─────────────────────────────────────────
    boolean existsByNameAndCompanyId(String name, Long companyId);

    // ── Platform-level ────────────────────────────────────────────────────────
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
}
