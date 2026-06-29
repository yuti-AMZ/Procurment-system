package com.procureai.invoice.controller;

import com.procureai.invoice.dto.InvoiceRequest;
import com.procureai.invoice.dto.InvoiceResponse;
import com.procureai.invoice.entity.InvoiceStatus;
import com.procureai.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(request));
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAll() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }

    @GetMapping("/po/{poId}")
    public ResponseEntity<List<InvoiceResponse>> getByPo(@PathVariable Long poId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByPoId(poId));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<InvoiceResponse>> getBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(invoiceService.getInvoicesBySupplier(supplierId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceResponse>> getByStatus(@PathVariable InvoiceStatus status) {
        return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<InvoiceResponse> approve(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(invoiceService.approveInvoice(id, body.get("approvedBy")));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<InvoiceResponse> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(invoiceService.rejectInvoice(id, body.get("notes")));
    }
}
