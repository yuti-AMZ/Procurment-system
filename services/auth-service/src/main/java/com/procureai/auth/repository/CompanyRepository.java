package com.procureai.auth.repository;

import com.procureai.auth.entity.Company;
import com.procureai.auth.entity.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByEmail(String email);
    boolean existsByRegistrationNumber(String registrationNumber);
    List<Company> findByStatusOrderByCreatedAtDesc(CompanyStatus status);
    Optional<Company> findByEmail(String email);
}
