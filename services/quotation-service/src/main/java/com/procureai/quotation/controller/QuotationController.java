package com.procureai.quotation.controller;

import com.procureai.quotation.dto.*;
import com.procureai.quotation.service.QuotationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quotation")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @PostMapping
    public ResponseEntity<QuotationResponse> createQuotation(
            @Valid @RequestBody QuotationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quotationService.createQuotation(request));
    }

    @GetMapping
    public ResponseEntity<List<QuotationResponse>> listQuotations(
            @RequestParam(required = false) Long rfqId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(quotationService.listQuotations(rfqId, supplierId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponse> getQuotation(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.getQuotation(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationResponse> updateQuotation(
            @PathVariable Long id,
            @Valid @RequestBody QuotationUpdateRequest request) {
        return ResponseEntity.ok(quotationService.updateQuotation(id, request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<QuotationResponse> submitQuotation(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.submitQuotation(id));
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<QuotationResponse> evaluateQuotation(
            @PathVariable Long id,
            @Valid @RequestBody QuotationEvaluateRequest request) {
        return ResponseEntity.ok(quotationService.evaluateQuotation(id, request));
    }

    @GetMapping("/rfq/{rfqId}/compare")
    public ResponseEntity<QuotationComparisonResponse> compareQuotations(
            @PathVariable Long rfqId) {
        return ResponseEntity.ok(quotationService.compareQuotations(rfqId));
    }
}
