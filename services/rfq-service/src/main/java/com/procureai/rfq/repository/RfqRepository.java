package com.procureai.rfq.repository;

import com.procureai.rfq.entity.Rfq;
import com.procureai.rfq.entity.RfqStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RfqRepository extends JpaRepository<Rfq, Long> {
    List<Rfq> findAllByOrderByCreatedAtDesc();
    List<Rfq> findByStatusOrderByCreatedAtDesc(RfqStatus status);
    List<Rfq> findByRequestedByOrderByCreatedAtDesc(String requestedBy);
}
