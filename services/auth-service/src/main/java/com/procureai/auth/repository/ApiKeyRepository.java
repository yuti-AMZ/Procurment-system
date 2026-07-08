package com.procureai.auth.repository;
import com.procureai.auth.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    List<ApiKey> findByCompanyId(Long companyId);
    List<ApiKey> findByStatus(String status);
    Optional<ApiKey> findByKeyHash(String keyHash);
}
