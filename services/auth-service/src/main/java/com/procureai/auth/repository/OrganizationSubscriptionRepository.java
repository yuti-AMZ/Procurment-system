package com.procureai.auth.repository;
import com.procureai.auth.entity.OrganizationSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrganizationSubscriptionRepository extends JpaRepository<OrganizationSubscription, Long> {
    List<OrganizationSubscription> findByCompanyId(Long companyId);
    List<OrganizationSubscription> findByStatus(String status);
    long countByStatus(String status);
    Optional<OrganizationSubscription> findTopByCompanyIdOrderByCreatedAtDesc(Long companyId);
}
