package com.procureai.procurement.repository.auth;

import com.procureai.procurement.entity.auth.OrgSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrgSubscriptionRepository extends JpaRepository<OrgSubscription, Long> {
    Optional<OrgSubscription> findByCompanyIdAndStatus(Long companyId, String status);
}
