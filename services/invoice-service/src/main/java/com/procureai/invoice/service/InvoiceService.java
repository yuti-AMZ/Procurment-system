package com.procureai.invoice.service;

import com.procureai.invoice.dto.InvoiceRequest;
import com.procureai.invoice.dto.InvoiceResponse;
import com.procureai.invoice.entity.Invoice;
import com.procureai.invoice.entity.InvoiceStatus;
import com.procureai.invoice.producer.InvoiceEventProducer;
import com.procureai.invoice.repository.InvoiceRepository;
import com.procureai.common.audit.AuditLogger;
import com.procureai.common.event.InvoiceEvent;
import com.procureai.common.gate.FeatureGate;
import com.procureai.common.security.TenantContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceEventProducer eventProducer;
    private final FeatureGate featureGate;
    private final AuditLogger auditLogger;

    public InvoiceService(InvoiceRepository invoiceRepository, InvoiceEventProducer eventProducer,
                          FeatureGate featureGate, AuditLogger auditLogger) {
        this.invoiceRepository = invoiceRepository;
        this.eventProducer = eventProducer;
        this.featureGate = featureGate;
        this.auditLogger = auditLogger;
    }

    public InvoiceResponse createInvoice(InvoiceRequest request) {
        featureGate.require("INVOICE");
        Long companyId = TenantContext.getCurrentCompanyId();
        if (invoiceRepository.existsByInvoiceNumberAndCompanyId(request.getInvoiceNumber(), companyId)) {
            throw new IllegalArgumentException("Invoice number already exists");
        }

        Invoice invoice = new Invoice();
        invoice.setCompanyId(TenantContext.getCurrentCompanyId());
        invoice.setInvoiceNumber(request.getInvoiceNumber());
        invoice.setPoId(request.getPoId());
        invoice.setPoNumber(request.getPoNumber());
        invoice.setSupplierId(request.getSupplierId());
        invoice.setSupplierName(request.getSupplierName());
        invoice.setTotalAmount(request.getTotalAmount());
        invoice.setCurrency(request.getCurrency());
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setNotes(request.getNotes());
        invoice.setDocumentUrl(request.getDocumentUrl());

        invoice = invoiceRepository.save(invoice);

        InvoiceEvent event = new InvoiceEvent();
        event.setCompanyId(invoice.getCompanyId());
        event.setInvoiceId(invoice.getId());
        event.setInvoiceNumber(invoice.getInvoiceNumber());
        event.setPoId(invoice.getPoId());
        event.setSupplierId(invoice.getSupplierId());
        event.setAmount(invoice.getTotalAmount());
        eventProducer.sendInvoiceUploaded(event);

        auditLogger.log("INVOICE_CREATED", "Invoice", invoice.getId(),
                companyId, null, "Invoice created: " + invoice.getInvoiceNumber());

        return toResponse(invoice);
    }

    public InvoiceResponse getInvoice(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        return toResponse(invoice);
    }

    public List<InvoiceResponse> getAllInvoices() {
        Long companyId = TenantContext.getCurrentCompanyId();
        return invoiceRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesByPoId(Long poId) {
        Long companyId = TenantContext.getCurrentCompanyId();
        return invoiceRepository.findByCompanyIdAndPoId(companyId, poId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesBySupplier(Long supplierId) {
        Long companyId = TenantContext.getCurrentCompanyId();
        return invoiceRepository.findByCompanyIdAndSupplierId(companyId, supplierId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
        Long companyId = TenantContext.getCurrentCompanyId();
        return invoiceRepository.findByCompanyIdAndStatus(companyId, status)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InvoiceResponse approveInvoice(Long id, Long approvedBy) {
        featureGate.require("INVOICE");
        Long companyId = TenantContext.getCurrentCompanyId();
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        invoice.setStatus(InvoiceStatus.APPROVED);
        invoice.setApprovedAt(LocalDateTime.now());
        invoice.setApprovedBy(approvedBy);
        invoice = invoiceRepository.save(invoice);

        auditLogger.log("INVOICE_APPROVED", "Invoice", invoice.getId(),
                companyId, approvedBy, "Invoice approved: " + invoice.getInvoiceNumber());

        return toResponse(invoice);
    }

    public InvoiceResponse rejectInvoice(Long id, String notes) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Invoice invoice = invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        invoice.setStatus(InvoiceStatus.REJECTED);
        invoice.setNotes(notes);
        invoice = invoiceRepository.save(invoice);

        auditLogger.log("INVOICE_REJECTED", "Invoice", invoice.getId(),
                companyId, null, "Invoice rejected: " + invoice.getInvoiceNumber() + ", notes: " + notes);

        return toResponse(invoice);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(), invoice.getInvoiceNumber(), invoice.getPoId(),
                invoice.getPoNumber(), invoice.getSupplierId(), invoice.getSupplierName(),
                invoice.getTotalAmount(), invoice.getCurrency(), invoice.getStatus(),
                invoice.getNotes(), invoice.getDocumentUrl(), invoice.getCreatedAt(),
                invoice.getApprovedAt(), invoice.getApprovedBy()
        );
    }
}
