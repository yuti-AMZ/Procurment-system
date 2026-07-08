package com.procureai.auth.repository;
import com.procureai.auth.entity.Webhook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WebhookRepository extends JpaRepository<Webhook, Long> {
    List<Webhook> findByCompanyId(Long companyId);
    List<Webhook> findByStatus(String status);
}
