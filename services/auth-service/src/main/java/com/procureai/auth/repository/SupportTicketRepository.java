package com.procureai.auth.repository;
import com.procureai.auth.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
    List<SupportTicket> findByStatusOrderByCreatedAtDesc(String status);
    List<SupportTicket> findByPriorityOrderByCreatedAtDesc(String priority);
    List<SupportTicket> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    long countByStatus(String status);
}
