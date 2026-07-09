package com.procureai.procurement.service;

import com.procureai.common.audit.AuditLogger;
import com.procureai.common.event.ProcurementEvent;
import com.procureai.common.gate.FeatureGate;
import com.procureai.common.model.PlanFeatures;
import com.procureai.common.security.TenantContext;
import com.procureai.procurement.config.FeatureFallbackLoader;
import com.procureai.procurement.dto.*;
import com.procureai.procurement.entity.*;
import com.procureai.procurement.exception.BusinessException;
import com.procureai.procurement.producer.ProcurementEventProducer;
import com.procureai.procurement.repository.*;
import com.procureai.procurement.entity.auth.AuthCompany;
import com.procureai.procurement.repository.auth.AuthCompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ProcurementService {

    private static final AtomicLong prCounter = new AtomicLong(System.currentTimeMillis() % 10000);
    private static final AtomicLong poCounter = new AtomicLong(System.currentTimeMillis() % 10000);

    private final PurchaseRequestRepository prRepository;
    private final PurchaseRequestItemRepository prItemRepository;
    private final PurchaseOrderRepository poRepository;
    private final PurchaseOrderItemRepository poItemRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final ApprovalRecordRepository approvalRecordRepository;
    private final ApprovalService approvalService;
    private final ProcurementEventProducer eventProducer;
    private final AuthCompanyRepository authCompanyRepository;
    private final FeatureGate featureGate;
    private final FeatureFallbackLoader featureFallback;
    private final AuditLogger auditLogger;

    public ProcurementService(PurchaseRequestRepository prRepository,
                              PurchaseRequestItemRepository prItemRepository,
                              PurchaseOrderRepository poRepository,
                              PurchaseOrderItemRepository poItemRepository,
                              ApprovalStepRepository approvalStepRepository,
                              ApprovalRecordRepository approvalRecordRepository,
                              ApprovalService approvalService,
                              ProcurementEventProducer eventProducer,
                              AuthCompanyRepository authCompanyRepository,
                              FeatureGate featureGate,
                              FeatureFallbackLoader featureFallback,
                              AuditLogger auditLogger) {
        this.prRepository = prRepository;
        this.prItemRepository = prItemRepository;
        this.poRepository = poRepository;
        this.poItemRepository = poItemRepository;
        this.approvalStepRepository = approvalStepRepository;
        this.approvalRecordRepository = approvalRecordRepository;
        this.approvalService = approvalService;
        this.eventProducer = eventProducer;
        this.authCompanyRepository = authCompanyRepository;
        this.featureGate = featureGate;
        this.featureFallback = featureFallback;
        this.auditLogger = auditLogger;
    }

    @Transactional
    public PRResponse createPR(PRCreateRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId != null) {
            PlanFeatures features = featureFallback.getFeaturesWithFallback(companyId);
            if (!features.isEnabled("PURCHASE_REQUESTS")) {
                throw new BusinessException("Feature 'PURCHASE_REQUESTS' is not available on your current plan. Upgrade to access this.");
            }
        }

        if (companyId != null) {
            LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            long currentPrCount = prRepository.countByCompanyIdAndCreatedAtAfter(companyId, monthStart);
            AuthCompany company = authCompanyRepository.findById(companyId)
                    .orElseThrow(() -> new BusinessException("Company not found"));
            Integer maxPrs = company.getMaxPurchaseRequestsPerMonth();
            if (maxPrs != null && currentPrCount >= maxPrs) {
                throw new BusinessException("Purchase request limit reached for this month. Please upgrade your subscription plan.");
            }
        }

        PurchaseRequest pr = new PurchaseRequest();
        pr.setPrNumber(generatePrNumber());
        pr.setCompanyId(companyId);
        pr.setTitle(request.getTitle());
        pr.setDescription(request.getDescription());
        pr.setRequestedBy(request.getRequestedBy());
        pr.setDepartment(request.getDepartment());
        pr.setStatus(PRStatus.DRAFT);
        pr.setUrgency(request.getUrgency());
        pr.setNotes(request.getNotes());
        pr.setAssignedSupplierId(request.getAssignedSupplierId());
        pr.setAssignedSupplierName(request.getAssignedSupplierName());

        List<PurchaseRequestItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (PRItemRequest itemReq : request.getItems()) {
            PurchaseRequestItem item = new PurchaseRequestItem();
            item.setItemName(itemReq.getItemName());
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setCategory(itemReq.getCategory());
            item.setUnitOfMeasure(itemReq.getUnitOfMeasure());
            item.setPurchaseRequest(pr);
            items.add(item);
            total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        pr.setItems(items);
        pr.setTotalAmount(total);

        pr = prRepository.save(pr);

        ProcurementEvent event = new ProcurementEvent();
        event.setPrId(pr.getId());
        event.setPrNumber(pr.getPrNumber());
        event.setRequestedBy(pr.getRequestedBy());
        event.setDepartment(pr.getDepartment());
        event.setTotalAmount(pr.getTotalAmount());
        event.setStatus(pr.getStatus().name());
        event.setCompanyId(TenantContext.getCurrentCompanyId());
        eventProducer.sendPrCreated(event);

        auditLogger.log("PR_CREATED", "PurchaseRequest", pr.getId(),
                TenantContext.getCurrentCompanyId(), null, "PR created: " + pr.getPrNumber());

        return toPRResponse(pr);
    }

    @Transactional
    public PRResponse updatePR(Long id, PRUpdateRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        PurchaseRequest pr = prRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("PR not found: " + id));
        if (pr.getStatus() != PRStatus.DRAFT) {
            throw new BusinessException("Can only update PR in DRAFT status");
        }

        if (request.getTitle() != null) pr.setTitle(request.getTitle());
        if (request.getDescription() != null) pr.setDescription(request.getDescription());
        if (request.getDepartment() != null) pr.setDepartment(request.getDepartment());
        if (request.getUrgency() != null) pr.setUrgency(request.getUrgency());
        if (request.getNotes() != null) pr.setNotes(request.getNotes());
        if (request.getAssignedSupplierId() != null) pr.setAssignedSupplierId(request.getAssignedSupplierId());
        if (request.getAssignedSupplierName() != null) pr.setAssignedSupplierName(request.getAssignedSupplierName());

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            pr.getItems().clear();
            BigDecimal total = BigDecimal.ZERO;
            for (PRItemRequest itemReq : request.getItems()) {
                PurchaseRequestItem item = new PurchaseRequestItem();
                item.setItemName(itemReq.getItemName());
                item.setDescription(itemReq.getDescription());
                item.setQuantity(itemReq.getQuantity());
                item.setUnitPrice(itemReq.getUnitPrice());
                item.setCategory(itemReq.getCategory());
                item.setUnitOfMeasure(itemReq.getUnitOfMeasure());
                item.setPurchaseRequest(pr);
                pr.getItems().add(item);
                total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            pr.setTotalAmount(total);
        }

        pr = prRepository.save(pr);
        return toPRResponse(pr);
    }

    @Transactional
    public PRResponse submitForApproval(Long id) {
        featureGate.require("APPROVAL_WORKFLOW");
        Long companyId = TenantContext.getCurrentCompanyId();
        PurchaseRequest pr = prRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("PR not found: " + id));
        if (pr.getStatus() != PRStatus.DRAFT) {
            throw new BusinessException("Only DRAFT PRs can be submitted for approval");
        }

        List<ApprovalStep> steps = approvalService.resolveApprovalSteps(pr.getTotalAmount());
        pr.setStatus(steps.isEmpty() ? PRStatus.APPROVED : PRStatus.PENDING_APPROVAL);

        if (steps.isEmpty()) {
            ProcurementEvent event = new ProcurementEvent();
            event.setPrId(pr.getId());
            event.setPrNumber(pr.getPrNumber());
            event.setRequestedBy(pr.getRequestedBy());
            event.setDepartment(pr.getDepartment());
            event.setTotalAmount(pr.getTotalAmount());
            event.setStatus(pr.getStatus().name());
            event.setCompanyId(TenantContext.getCurrentCompanyId());
            eventProducer.sendPrApproved(event);
        }

        pr = prRepository.save(pr);

        auditLogger.log("PR_SUBMITTED", "PurchaseRequest", pr.getId(),
                TenantContext.getCurrentCompanyId(), null,
                "PR submitted for approval: " + pr.getPrNumber());

        return toPRResponse(pr);
    }

    @Transactional
    public PRResponse approveOrReject(Long id, ApprovalActionRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        PurchaseRequest pr = prRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("PR not found: " + id));
        if (pr.getStatus() != PRStatus.PENDING_APPROVAL) {
            throw new BusinessException("PR is not pending approval");
        }

        List<ApprovalStep> steps = approvalService.resolveApprovalSteps(pr.getTotalAmount());
        ApprovalStep nextStep = approvalService.getNextPendingStep(id, steps);
        if (nextStep == null) {
            throw new BusinessException("No pending approval step found");
        }

        ApprovalStatus approvalStatus;
        switch (request.getAction().toUpperCase()) {
            case "APPROVE" -> approvalStatus = ApprovalStatus.APPROVED;
            case "REJECT" -> approvalStatus = ApprovalStatus.REJECTED;
            default -> throw new BusinessException("Invalid action: " + request.getAction());
        }

        ApprovalRecord record = new ApprovalRecord();
        record.setPurchaseRequest(pr);
        record.setApproverId(request.getApproverId());
        record.setApproverName(request.getApproverName());
        record.setRoleName(nextStep.getRoleName());
        record.setStatus(approvalStatus);
        record.setComments(request.getComments());
        record.setStepOrder(nextStep.getStepOrder());
        approvalRecordRepository.save(record);

        if (approvalStatus == ApprovalStatus.REJECTED) {
            pr.setStatus(PRStatus.REJECTED);
            prRepository.save(pr);
            return toPRResponse(pr);
        }

        if (approvalService.isFullyApproved(id, steps)) {
            pr.setStatus(PRStatus.APPROVED);
            prRepository.save(pr);

            ProcurementEvent event = new ProcurementEvent();
            event.setPrId(pr.getId());
            event.setPrNumber(pr.getPrNumber());
            event.setRequestedBy(pr.getRequestedBy());
            event.setDepartment(pr.getDepartment());
            event.setTotalAmount(pr.getTotalAmount());
            event.setStatus(pr.getStatus().name());
            event.setCompanyId(TenantContext.getCurrentCompanyId());
            eventProducer.sendPrApproved(event);
        }

        return toPRResponse(prRepository.findById(id).orElseThrow());
    }

    public PRResponse getPR(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        PurchaseRequest pr = prRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("PR not found: " + id));
        return toPRResponse(pr);
    }

    public List<PRResponse> listPRs(String status) {
        Long companyId = TenantContext.getCurrentCompanyId();
        List<PurchaseRequest> prs;
        if (status != null && !status.isBlank()) {
            try {
                PRStatus prStatus = PRStatus.valueOf(status.toUpperCase());
                prs = prRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, prStatus);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid status: " + status);
            }
        } else {
            prs = prRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        }
        return prs.stream().map(this::toPRResponse).toList();
    }

    @Transactional
    public POResponse generatePO(Long id) {
        featureGate.require("PURCHASE_ORDERS");
        Long companyId = TenantContext.getCurrentCompanyId();
        PurchaseRequest pr = prRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("PR not found: " + id));
        if (pr.getStatus() != PRStatus.APPROVED) {
            throw new BusinessException("Only APPROVED PRs can generate PO");
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePoNumber());
        po.setCompanyId(companyId);
        po.setPurchaseRequest(pr);
        po.setVendorName(pr.getAssignedSupplierName());
        po.setVendorId(pr.getAssignedSupplierId());
        po.setStatus(POStatus.GENERATED);
        po.setTotalAmount(pr.getTotalAmount());

        List<PurchaseOrderItem> poItems = new ArrayList<>();
        for (PurchaseRequestItem prItem : pr.getItems()) {
            PurchaseOrderItem poItem = new PurchaseOrderItem();
            poItem.setItemName(prItem.getItemName());
            poItem.setDescription(prItem.getDescription());
            poItem.setQuantity(prItem.getQuantity());
            poItem.setUnitPrice(prItem.getUnitPrice());
            poItem.setUnitOfMeasure(prItem.getUnitOfMeasure());
            poItem.setPurchaseOrder(po);
            poItems.add(poItem);
        }
        po.setItems(poItems);
        po = poRepository.save(po);

        pr.setStatus(PRStatus.PO_GENERATED);
        prRepository.save(pr);

        auditLogger.log("PO_GENERATED", "PurchaseOrder", po.getId(),
                TenantContext.getCurrentCompanyId(), null,
                "PO generated: " + po.getPoNumber() + " from PR: " + pr.getPrNumber());

        ProcurementEvent event = new ProcurementEvent();
        event.setPrId(pr.getId());
        event.setPrNumber(pr.getPrNumber());
        event.setPoId(po.getId());
        event.setPoNumber(po.getPoNumber());
        event.setRequestedBy(pr.getRequestedBy());
        event.setDepartment(pr.getDepartment());
        event.setTotalAmount(po.getTotalAmount());
        event.setStatus(POStatus.GENERATED.name());
        event.setCompanyId(TenantContext.getCurrentCompanyId());
        eventProducer.sendPoGenerated(event);

        return toPOResponse(po);
    }

    public POResponse getPO(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        PurchaseOrder po = poRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("PO not found: " + id));
        return toPOResponse(po);
    }

    public List<POResponse> listPOs(String status) {
        Long companyId = TenantContext.getCurrentCompanyId();
        List<PurchaseOrder> pos;
        if (status != null && !status.isBlank()) {
            try {
                POStatus poStatus = POStatus.valueOf(status.toUpperCase());
                pos = poRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, poStatus);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid status: " + status);
            }
        } else {
            pos = poRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        }
        return pos.stream().map(this::toPOResponse).toList();
    }

    @Transactional
    public POResponse updatePOStatus(Long id, POStatusUpdateRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        PurchaseOrder po = poRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("PO not found: " + id));
        POStatus newStatus;
        try {
            newStatus = POStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid PO status: " + request.getStatus());
        }
        po.setStatus(newStatus);
        po = poRepository.save(po);
        return toPOResponse(po);
    }

    public List<ApprovalStepResponse> getApprovalSteps() {
        return approvalStepRepository.findByCompanyIdOrderByStepOrderAsc(TenantContext.getCurrentCompanyId())
                .stream().map(this::toApprovalStepResponse).toList();
    }

    @Transactional
    public ApprovalStepResponse createApprovalStep(ApprovalStepRequest request) {
        ApprovalStep step = new ApprovalStep();
        step.setCompanyId(TenantContext.getCurrentCompanyId());
        step.setRoleName(request.getRoleName());
        step.setStepOrder(request.getStepOrder());
        step.setMinAmount(request.getMinAmount());
        step.setMaxAmount(request.getMaxAmount());
        step.setDescription(request.getDescription());
        step = approvalStepRepository.save(step);
        return toApprovalStepResponse(step);
    }

    @Transactional
    public void deleteApprovalStep(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        ApprovalStep step = approvalStepRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Approval step not found: " + id));
        if (!companyId.equals(step.getCompanyId())) throw new BusinessException("Approval step not found");
        approvalStepRepository.deleteById(id);
    }

    private String generatePrNumber() {
        return "PR-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now())
                + "-" + String.format("%04d", prCounter.incrementAndGet() % 10000);
    }

    private String generatePoNumber() {
        return "PO-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now())
                + "-" + String.format("%04d", poCounter.incrementAndGet() % 10000);
    }

    private PRResponse toPRResponse(PurchaseRequest pr) {
        PRResponse resp = new PRResponse();
        resp.setId(pr.getId());
        resp.setPrNumber(pr.getPrNumber());
        resp.setTitle(pr.getTitle());
        resp.setDescription(pr.getDescription());
        resp.setRequestedBy(pr.getRequestedBy());
        resp.setDepartment(pr.getDepartment());
        resp.setStatus(pr.getStatus());
        resp.setTotalAmount(pr.getTotalAmount());
        resp.setUrgency(pr.getUrgency());
        resp.setNotes(pr.getNotes());
        resp.setAssignedSupplierId(pr.getAssignedSupplierId());
        resp.setAssignedSupplierName(pr.getAssignedSupplierName());
        resp.setCreatedAt(pr.getCreatedAt());
        resp.setUpdatedAt(pr.getUpdatedAt());

        if (pr.getItems() != null) {
            resp.setItems(pr.getItems().stream().map(this::toPRItemResponse).toList());
        }

        if (pr.getApprovalRecords() != null) {
            resp.setApprovalRecords(pr.getApprovalRecords().stream()
                    .map(this::toApprovalRecordResponse).toList());
        }

        if (pr.getPurchaseOrder() != null) {
            PRResponse.PurchaseOrderRef ref = new PRResponse.PurchaseOrderRef();
            ref.setId(pr.getPurchaseOrder().getId());
            ref.setPoNumber(pr.getPurchaseOrder().getPoNumber());
            resp.setPoReference(ref);
        }

        return resp;
    }

    private PRItemResponse toPRItemResponse(PurchaseRequestItem item) {
        PRItemResponse resp = new PRItemResponse();
        resp.setId(item.getId());
        resp.setItemName(item.getItemName());
        resp.setDescription(item.getDescription());
        resp.setQuantity(item.getQuantity());
        resp.setUnitPrice(item.getUnitPrice());
        resp.setTotalPrice(item.getTotalPrice());
        resp.setCategory(item.getCategory());
        resp.setUnitOfMeasure(item.getUnitOfMeasure());
        return resp;
    }

    private ApprovalRecordResponse toApprovalRecordResponse(ApprovalRecord r) {
        ApprovalRecordResponse resp = new ApprovalRecordResponse();
        resp.setId(r.getId());
        resp.setApproverId(r.getApproverId());
        resp.setApproverName(r.getApproverName());
        resp.setRoleName(r.getRoleName());
        resp.setStatus(r.getStatus());
        resp.setComments(r.getComments());
        resp.setStepOrder(r.getStepOrder());
        resp.setActionedAt(r.getActionedAt());
        return resp;
    }

    private POResponse toPOResponse(PurchaseOrder po) {
        POResponse resp = new POResponse();
        resp.setId(po.getId());
        resp.setPoNumber(po.getPoNumber());
        resp.setPurchaseRequestId(po.getPurchaseRequest() != null ? po.getPurchaseRequest().getId() : null);
        resp.setPrNumber(po.getPurchaseRequest() != null ? po.getPurchaseRequest().getPrNumber() : null);
        resp.setVendorName(po.getVendorName());
        resp.setVendorId(po.getVendorId());
        resp.setStatus(po.getStatus());
        resp.setTotalAmount(po.getTotalAmount());
        resp.setPaymentTerms(po.getPaymentTerms());
        resp.setDeliveryTerms(po.getDeliveryTerms());
        resp.setShippingAddress(po.getShippingAddress());
        resp.setOrderDate(po.getOrderDate());
        resp.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        resp.setCreatedAt(po.getCreatedAt());
        resp.setUpdatedAt(po.getUpdatedAt());

        if (po.getItems() != null) {
            resp.setItems(po.getItems().stream().map(this::toPOItemResponse).toList());
        }
        return resp;
    }

    private POItemResponse toPOItemResponse(PurchaseOrderItem item) {
        POItemResponse resp = new POItemResponse();
        resp.setId(item.getId());
        resp.setItemName(item.getItemName());
        resp.setDescription(item.getDescription());
        resp.setQuantity(item.getQuantity());
        resp.setReceivedQuantity(item.getReceivedQuantity());
        resp.setUnitPrice(item.getUnitPrice());
        resp.setTotalPrice(item.getTotalPrice());
        resp.setUnitOfMeasure(item.getUnitOfMeasure());
        return resp;
    }

    private ApprovalStepResponse toApprovalStepResponse(ApprovalStep step) {
        ApprovalStepResponse resp = new ApprovalStepResponse();
        resp.setId(step.getId());
        resp.setRoleName(step.getRoleName());
        resp.setStepOrder(step.getStepOrder());
        resp.setMinAmount(step.getMinAmount());
        resp.setMaxAmount(step.getMaxAmount());
        resp.setDescription(step.getDescription());
        return resp;
    }
}
