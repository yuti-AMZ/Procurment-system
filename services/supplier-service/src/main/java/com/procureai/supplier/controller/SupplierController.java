package com.procureai.supplier.controller;

import com.procureai.supplier.dto.*;
import com.procureai.supplier.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping("/register")
    public ResponseEntity<SupplierResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.register(request));
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(supplierService.getAll(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SupplierResponse>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(supplierService.getByCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(supplierService.update(id, request));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<SupplierResponse> approve(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request,
            @RequestHeader("X-User-Id") Long approvedBy) {
        return ResponseEntity.ok(supplierService.approve(id, request, approvedBy));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(new java.util.HashMap<>() {{
            put("pending", supplierService.countByStatus(
                    com.procureai.supplier.entity.SupplierStatus.PENDING));
            put("approved", supplierService.countByStatus(
                    com.procureai.supplier.entity.SupplierStatus.APPROVED));
            put("rejected", supplierService.countByStatus(
                    com.procureai.supplier.entity.SupplierStatus.REJECTED));
        }});
    }
}
