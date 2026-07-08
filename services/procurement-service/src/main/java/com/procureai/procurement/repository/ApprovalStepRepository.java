package com.procureai.procurement.repository;

import com.procureai.procurement.entity.ApprovalStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.math.BigDecimal;
import java.util.List;

public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {
    List<ApprovalStep> findAllByOrderByStepOrderAsc();
    List<ApprovalStep> findByMinAmountLessThanEqualAndMaxAmountGreaterThanEqualOrderByStepOrderAsc(
            BigDecimal minAmount, BigDecimal maxAmount);
    List<ApprovalStep> findByCompanyIdOrderByStepOrderAsc(Long companyId);
}
