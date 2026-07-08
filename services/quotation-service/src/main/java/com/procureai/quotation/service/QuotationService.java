package com.procureai.quotation.service;

import com.procureai.common.audit.AuditLogger;
import com.procureai.common.event.QuotationEvent;
import com.procureai.common.gate.FeatureGate;
import com.procureai.common.security.TenantContext;
import com.procureai.quotation.dto.*;
import com.procureai.quotation.entity.*;
import com.procureai.quotation.exception.BusinessException;
import com.procureai.quotation.producer.QuotationEventProducer;
import com.procureai.quotation.repository.QuotationLineItemRepository;
import com.procureai.quotation.repository.QuotationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class QuotationService {

    private static final AtomicLong quoteCounter = new AtomicLong(System.currentTimeMillis() % 10000);

    private final QuotationRepository quotationRepository;
    private final QuotationLineItemRepository lineItemRepository;
    private final QuotationEventProducer eventProducer;
    private final FeatureGate featureGate;
    private final AuditLogger auditLogger;

    public QuotationService(QuotationRepository quotationRepository,
                            QuotationLineItemRepository lineItemRepository,
                            QuotationEventProducer eventProducer,
                            FeatureGate featureGate,
                            AuditLogger auditLogger) {
        this.quotationRepository = quotationRepository;
        this.lineItemRepository = lineItemRepository;
        this.eventProducer = eventProducer;
        this.featureGate = featureGate;
        this.auditLogger = auditLogger;
    }

    @Transactional
    public QuotationResponse createQuotation(QuotationCreateRequest request) {
        featureGate.require("QUOTATION");
        Long companyId = TenantContext.getCurrentCompanyId();
        List<Quotation> existing = quotationRepository.findByCompanyIdAndRfqIdAndSupplierId(
                companyId, request.getRfqId(), request.getSupplierId());
        boolean hasActive = existing.stream()
                .anyMatch(q -> q.getStatus() == QuotationStatus.DRAFT
                        || q.getStatus() == QuotationStatus.SUBMITTED);
        if (hasActive) {
            throw new BusinessException("Supplier already has an active quotation for this RFQ");
        }

        Quotation q = new Quotation();
        q.setQuotationNumber(generateQuotationNumber());
        q.setRfqId(request.getRfqId());
        q.setRfqNumber(request.getRfqNumber());
        q.setRfqTitle(request.getRfqTitle());
        q.setSupplierId(request.getSupplierId());
        q.setSupplierName(request.getSupplierName());
        q.setSupplierEmail(request.getSupplierEmail());
        q.setCompanyId(TenantContext.getCurrentCompanyId());
        q.setStatus(QuotationStatus.DRAFT);
        q.setCurrency(request.getCurrency());
        q.setValidityStartDate(request.getValidityStartDate());
        q.setValidityEndDate(request.getValidityEndDate());
        q.setDeliveryTerms(request.getDeliveryTerms());
        q.setPaymentTerms(request.getPaymentTerms());
        q.setNotes(request.getNotes());

        BigDecimal total = BigDecimal.ZERO;
        List<QuotationLineItem> items = new ArrayList<>();
        for (QuotationLineItemRequest itemReq : request.getLineItems()) {
            QuotationLineItem item = new QuotationLineItem();
            item.setRfqLineItemId(itemReq.getRfqLineItemId());
            item.setItemName(itemReq.getItemName());
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setUnitOfMeasure(itemReq.getUnitOfMeasure());
            item.setQuotation(q);
            items.add(item);
            total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        q.setLineItems(items);
        q.setTotalAmount(total);

        q = quotationRepository.save(q);
        return toResponse(q);
    }

    @Transactional
    public QuotationResponse updateQuotation(Long id, QuotationUpdateRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Quotation q = quotationRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("Quotation not found: " + id));
        if (q.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessException("Can only update a DRAFT quotation");
        }

        if (request.getCurrency() != null) q.setCurrency(request.getCurrency());
        if (request.getValidityStartDate() != null) q.setValidityStartDate(request.getValidityStartDate());
        if (request.getValidityEndDate() != null) q.setValidityEndDate(request.getValidityEndDate());
        if (request.getDeliveryTerms() != null) q.setDeliveryTerms(request.getDeliveryTerms());
        if (request.getPaymentTerms() != null) q.setPaymentTerms(request.getPaymentTerms());
        if (request.getNotes() != null) q.setNotes(request.getNotes());

        if (request.getLineItems() != null && !request.getLineItems().isEmpty()) {
            q.getLineItems().clear();
            BigDecimal total = BigDecimal.ZERO;
            for (QuotationLineItemRequest itemReq : request.getLineItems()) {
                QuotationLineItem item = new QuotationLineItem();
                item.setRfqLineItemId(itemReq.getRfqLineItemId());
                item.setItemName(itemReq.getItemName());
                item.setDescription(itemReq.getDescription());
                item.setQuantity(itemReq.getQuantity());
                item.setUnitPrice(itemReq.getUnitPrice());
                item.setUnitOfMeasure(itemReq.getUnitOfMeasure());
                item.setQuotation(q);
                q.getLineItems().add(item);
                total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            q.setTotalAmount(total);
        }

        q = quotationRepository.save(q);
        return toResponse(q);
    }

    @Transactional
    public QuotationResponse submitQuotation(Long id) {
        featureGate.require("QUOTATION");
        Long companyId = TenantContext.getCurrentCompanyId();
        Quotation q = quotationRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("Quotation not found: " + id));
        if (q.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessException("Only DRAFT quotations can be submitted");
        }
        if (q.getLineItems() == null || q.getLineItems().isEmpty()) {
            throw new BusinessException("Cannot submit quotation with no line items");
        }

        q.setStatus(QuotationStatus.SUBMITTED);
        q = quotationRepository.save(q);

        QuotationEvent event = new QuotationEvent();
        event.setQuotationId(q.getId());
        event.setQuotationNumber(q.getQuotationNumber());
        event.setRfqId(q.getRfqId());
        event.setSupplierId(q.getSupplierId());
        event.setSupplierName(q.getSupplierName());
        event.setTotalAmount(q.getTotalAmount());
        event.setStatus(q.getStatus().name());
        eventProducer.sendQuotationSubmitted(event);

        auditLogger.log("QUOTATION_SUBMITTED", "Quotation", q.getId(),
                companyId, null, "Quotation submitted: " + q.getQuotationNumber());

        return toResponse(q);
    }

    @Transactional
    public QuotationResponse evaluateQuotation(Long id, QuotationEvaluateRequest request) {
        featureGate.require("QUOTATION");
        Long companyId = TenantContext.getCurrentCompanyId();
        Quotation q = quotationRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("Quotation not found: " + id));
        if (q.getStatus() != QuotationStatus.SUBMITTED
                && q.getStatus() != QuotationStatus.UNDER_EVALUATION) {
            throw new BusinessException("Quotation must be SUBMITTED to evaluate");
        }

        QuotationStatus newStatus;
        switch (request.getAction().toUpperCase()) {
            case "ACCEPT" -> newStatus = QuotationStatus.ACCEPTED;
            case "REJECT" -> newStatus = QuotationStatus.REJECTED;
            case "MARK_EVALUATION" -> newStatus = QuotationStatus.UNDER_EVALUATION;
            default -> throw new BusinessException("Invalid action: " + request.getAction());
        }

        q.setStatus(newStatus);
        if (request.getScore() != null) q.setEvaluationScore(request.getScore());
        if (request.getComments() != null) q.setEvaluationComments(request.getComments());
        if (request.getEvaluatedBy() != null) q.setEvaluatedBy(request.getEvaluatedBy());
        q.setEvaluatedAt(LocalDateTime.now());

        q = quotationRepository.save(q);

        auditLogger.log("QUOTATION_EVALUATED", "Quotation", q.getId(),
                companyId, TenantContext.getCurrentUserId(),
                "Quotation evaluated: " + q.getQuotationNumber() + ", action: " + request.getAction());

        if (newStatus == QuotationStatus.ACCEPTED) {
            List<Quotation> others = quotationRepository.findByCompanyIdAndRfqIdAndStatusIn(
                    q.getCompanyId(), q.getRfqId(), List.of(QuotationStatus.SUBMITTED, QuotationStatus.UNDER_EVALUATION));
            for (Quotation other : others) {
                if (!other.getId().equals(q.getId())) {
                    other.setStatus(QuotationStatus.REJECTED);
                    quotationRepository.save(other);
                }
            }
        }

        return toResponse(q);
    }

    public QuotationResponse getQuotation(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Quotation q = quotationRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException("Quotation not found: " + id));
        return toResponse(q);
    }

    public List<QuotationResponse> listQuotations(Long rfqId, Long supplierId, String status) {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (rfqId != null && supplierId != null) {
            return quotationRepository.findByCompanyIdAndRfqIdAndSupplierId(companyId, rfqId, supplierId)
                    .stream().map(this::toResponse).toList();
        }
        if (rfqId != null) {
            return quotationRepository.findByCompanyIdAndRfqIdOrderByTotalAmountAsc(companyId, rfqId)
                    .stream().map(this::toResponse).toList();
        }
        if (supplierId != null) {
            return quotationRepository.findByCompanyIdAndSupplierIdOrderByCreatedAtDesc(companyId, supplierId)
                    .stream().map(this::toResponse).toList();
        }
        if (status != null && !status.isBlank()) {
            try {
                QuotationStatus qs = QuotationStatus.valueOf(status.toUpperCase());
                return quotationRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, qs)
                        .stream().map(this::toResponse).toList();
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid status: " + status);
            }
        }
        return quotationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(this::toResponse).toList();
    }

    public QuotationComparisonResponse compareQuotations(Long rfqId) {
        Long companyId = TenantContext.getCurrentCompanyId();
        List<Quotation> quotations = quotationRepository.findByCompanyIdAndRfqIdOrderByTotalAmountAsc(companyId, rfqId);

        QuotationComparisonResponse resp = new QuotationComparisonResponse();
        resp.setRfqId(rfqId);
        if (!quotations.isEmpty()) {
            resp.setRfqNumber(quotations.get(0).getRfqNumber());
        }

        List<QuotationComparisonResponse.QuotationSummary> summaries = quotations.stream()
                .filter(q -> q.getStatus() == QuotationStatus.SUBMITTED
                        || q.getStatus() == QuotationStatus.UNDER_EVALUATION
                        || q.getStatus() == QuotationStatus.ACCEPTED)
                .sorted(Comparator.comparing(Quotation::getTotalAmount))
                .map(q -> {
                    QuotationComparisonResponse.QuotationSummary s =
                            new QuotationComparisonResponse.QuotationSummary();
                    s.setQuotationId(q.getId());
                    s.setQuotationNumber(q.getQuotationNumber());
                    s.setSupplierId(q.getSupplierId());
                    s.setSupplierName(q.getSupplierName());
                    s.setStatus(QuotationComparisonResponse.QuotationStatus.valueOf(q.getStatus().name()));
                    s.setTotalAmount(q.getTotalAmount());
                    s.setEvaluationScore(q.getEvaluationScore());
                    s.setEvaluationComments(q.getEvaluationComments());
                    s.setItemCount(q.getLineItems() != null ? q.getLineItems().size() : 0);
                    return s;
                }).toList();

        resp.setQuotations(summaries);
        return resp;
    }

    private String generateQuotationNumber() {
        return "QTN-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now())
                + "-" + String.format("%04d", quoteCounter.incrementAndGet() % 10000);
    }

    private QuotationResponse toResponse(Quotation q) {
        QuotationResponse r = new QuotationResponse();
        r.setId(q.getId());
        r.setQuotationNumber(q.getQuotationNumber());
        r.setRfqId(q.getRfqId());
        r.setRfqNumber(q.getRfqNumber());
        r.setRfqTitle(q.getRfqTitle());
        r.setSupplierId(q.getSupplierId());
        r.setSupplierName(q.getSupplierName());
        r.setSupplierEmail(q.getSupplierEmail());
        r.setStatus(q.getStatus());
        r.setTotalAmount(q.getTotalAmount());
        r.setCurrency(q.getCurrency());
        r.setValidityStartDate(q.getValidityStartDate());
        r.setValidityEndDate(q.getValidityEndDate());
        r.setDeliveryTerms(q.getDeliveryTerms());
        r.setPaymentTerms(q.getPaymentTerms());
        r.setNotes(q.getNotes());
        r.setEvaluationScore(q.getEvaluationScore());
        r.setEvaluationComments(q.getEvaluationComments());
        r.setEvaluatedBy(q.getEvaluatedBy());
        r.setEvaluatedAt(q.getEvaluatedAt());
        r.setCreatedAt(q.getCreatedAt());
        r.setUpdatedAt(q.getUpdatedAt());

        if (q.getLineItems() != null) {
            r.setLineItems(q.getLineItems().stream().map(this::toLineItemResponse).toList());
        }
        return r;
    }

    private QuotationLineItemResponse toLineItemResponse(QuotationLineItem item) {
        QuotationLineItemResponse r = new QuotationLineItemResponse();
        r.setId(item.getId());
        r.setRfqLineItemId(item.getRfqLineItemId());
        r.setItemName(item.getItemName());
        r.setDescription(item.getDescription());
        r.setQuantity(item.getQuantity());
        r.setUnitPrice(item.getUnitPrice());
        r.setTotalPrice(item.getTotalPrice());
        r.setUnitOfMeasure(item.getUnitOfMeasure());
        return r;
    }
}
