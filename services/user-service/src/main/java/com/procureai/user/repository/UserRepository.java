package com.procureai.user.repository;

import com.procureai.user.entity.User;
import com.procureai.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // ── Tenant-safe single-record lookups ────────────────────────────────────
    Optional<User> findByIdAndCompanyId(Long id, Long companyId);

    // ── Tenant-scoped queries ─────────────────────────────────────────────────
    List<User> findByCompanyId(Long companyId);
    List<User> findByCompanyIdAndRole(Long companyId, UserRole role);
    List<User> findByCompanyIdAndDepartmentId(Long companyId, Long departmentId);

    // ── Platform-level / super-admin queries ─────────────────────────────────
    List<User> findByRole(UserRole role);
    List<User> findByDepartmentId(Long departmentId);
    boolean existsByEmail(String email);

    // ── Usage limit queries ──────────────────────────────────────────────────
    long countByCompanyId(Long companyId);
}
