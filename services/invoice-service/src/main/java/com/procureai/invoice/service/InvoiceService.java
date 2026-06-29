package com.procureai.invoice.service;

import com.procureai.invoice.dto.InvoiceRequest;
import com.procureai.invoice.dto.InvoiceResponse;
import com.procureai.invoice.entity.Invoice;
import com.procureai.invoice.entity.InvoiceStatus;
import com.procureai.invoice.producer.InvoiceEventProducer;
import com.procureai.invoice.repository.InvoiceRepository;
import com.procureai.common.event.InvoiceEvent;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceEventProducer eventProducer;

    public InvoiceService(InvoiceRepository invoiceRepository, InvoiceEventProducer eventProducer) {
        this.invoiceRepository = invoiceRepository;
        this.eventProducer = eventProducer;
    }

    public InvoiceResponse createInvoice(InvoiceRequest request) {
        if (invoiceRepository.existsByInvoiceNumber(request.getInvoiceNumber())) {
            throw new IllegalArgumentException("Invoice number already exists");
        }

        Invoice invoice = new Invoice();
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
        event.setInvoiceId(invoice.getId());
        event.setInvoiceNumber(invoice.getInvoiceNumber());
        event.setPoId(invoice.getPoId());
        event.setSupplierId(invoice.getSupplierId());
        event.setAmount(invoice.getTotalAmount());
        eventProducer.sendInvoiceUploaded(event);

        return toResponse(invoice);
    }

    public InvoiceResponse getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        return toResponse(invoice);
    }

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesByPoId(Long poId) {
        return invoiceRepository.findByPoId(poId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesBySupplier(Long supplierId) {
        return invoiceRepository.findBySupplierId(supplierId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<InvoiceResponse> getInvoicesByStatus(InvoiceStatus status) {
        return invoiceRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InvoiceResponse approveInvoice(Long id, Long approvedBy) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        invoice.setStatus(InvoiceStatus.APPROVED);
        invoice.setApprovedAt(LocalDateTime.now());
        invoice.setApprovedBy(approvedBy);
        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    public InvoiceResponse rejectInvoice(Long id, String notes) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        invoice.setStatus(InvoiceStatus.REJECTED);
        invoice.setNotes(notes);
        invoice = invoiceRepository.save(invoice);
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
