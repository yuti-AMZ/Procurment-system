package com.procureai.procurement.service;

import com.procureai.procurement.entity.*;
import com.procureai.procurement.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ApprovalService {

    private final ApprovalStepRepository approvalStepRepository;
    private final ApprovalRecordRepository approvalRecordRepository;

    public ApprovalService(ApprovalStepRepository approvalStepRepository,
                           ApprovalRecordRepository approvalRecordRepository) {
        this.approvalStepRepository = approvalStepRepository;
        this.approvalRecordRepository = approvalRecordRepository;
    }

    public List<ApprovalStep> resolveApprovalSteps(BigDecimal totalAmount) {
        List<ApprovalStep> allSteps = approvalStepRepository.findAllByOrderByStepOrderAsc();
        if (allSteps.isEmpty()) return List.of();

        return allSteps.stream()
                .filter(s -> totalAmount == null
                        || (s.getMinAmount() == null || totalAmount.compareTo(s.getMinAmount()) >= 0)
                        && (s.getMaxAmount() == null || totalAmount.compareTo(s.getMaxAmount()) <= 0))
                .toList();
    }

    public ApprovalStep getNextPendingStep(Long prId, List<ApprovalStep> steps) {
        for (ApprovalStep step : steps) {
            boolean alreadyActioned = approvalRecordRepository
                    .findByPurchaseRequestIdOrderByStepOrderAsc(prId)
                    .stream()
                    .anyMatch(r -> r.getRoleName().equals(step.getRoleName())
                            && r.getStatus() != ApprovalStatus.PENDING);
            if (!alreadyActioned) return step;
        }
        return null;
    }

    public boolean isFullyApproved(Long prId, List<ApprovalStep> steps) {
        if (steps.isEmpty()) return true;
        long approvedCount = approvalRecordRepository
                .findByPurchaseRequestIdOrderByStepOrderAsc(prId)
                .stream()
                .filter(r -> r.getStatus() == ApprovalStatus.APPROVED)
                .count();
        return approvedCount >= steps.size();
    }

    public boolean isAnyRejected(Long prId) {
        return approvalRecordRepository
                .findByPurchaseRequestIdOrderByStepOrderAsc(prId)
                .stream()
                .anyMatch(r -> r.getStatus() == ApprovalStatus.REJECTED);
    }
}
