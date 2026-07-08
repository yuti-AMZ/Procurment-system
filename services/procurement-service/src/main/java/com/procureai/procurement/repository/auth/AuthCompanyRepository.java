package com.procureai.procurement.repository.auth;

import com.procureai.procurement.entity.auth.AuthCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthCompanyRepository extends JpaRepository<AuthCompany, Long> {
}
