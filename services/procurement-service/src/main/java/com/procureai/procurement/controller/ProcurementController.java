package com.procureai.procurement.controller;

import com.procureai.procurement.dto.*;
import com.procureai.procurement.service.ProcurementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/procurement")
public class ProcurementController {

    private final ProcurementService procurementService;

    public ProcurementController(ProcurementService procurementService) {
        this.procurementService = procurementService;
    }

    @PostMapping("/pr")
    public ResponseEntity<PRResponse> createPR(@Valid @RequestBody PRCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(procurementService.createPR(request));
    }

    @GetMapping("/pr")
    public ResponseEntity<List<PRResponse>> listPRs(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(procurementService.listPRs(status));
    }

    @GetMapping("/pr/{id}")
    public ResponseEntity<PRResponse> getPR(@PathVariable Long id) {
        return ResponseEntity.ok(procurementService.getPR(id));
    }

    @PutMapping("/pr/{id}")
    public ResponseEntity<PRResponse> updatePR(@PathVariable Long id,
                                                @Valid @RequestBody PRUpdateRequest request) {
        return ResponseEntity.ok(procurementService.updatePR(id, request));
    }

    @PostMapping("/pr/{id}/submit")
    public ResponseEntity<PRResponse> submitForApproval(@PathVariable Long id) {
        return ResponseEntity.ok(procurementService.submitForApproval(id));
    }

    @PostMapping("/pr/{id}/approve")
    public ResponseEntity<PRResponse> approveOrReject(@PathVariable Long id,
                                                       @Valid @RequestBody ApprovalActionRequest request) {
        return ResponseEntity.ok(procurementService.approveOrReject(id, request));
    }

    @PostMapping("/pr/{id}/generate-po")
    public ResponseEntity<POResponse> generatePO(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(procurementService.generatePO(id));
    }

    @GetMapping("/po")
    public ResponseEntity<List<POResponse>> listPOs(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(procurementService.listPOs(status));
    }

    @GetMapping("/po/{id}")
    public ResponseEntity<POResponse> getPO(@PathVariable Long id) {
        return ResponseEntity.ok(procurementService.getPO(id));
    }

    @PutMapping("/po/{id}/status")
    public ResponseEntity<POResponse> updatePOStatus(@PathVariable Long id,
                                                      @Valid @RequestBody POStatusUpdateRequest request) {
        return ResponseEntity.ok(procurementService.updatePOStatus(id, request));
    }

    @GetMapping("/approval-steps")
    public ResponseEntity<List<ApprovalStepResponse>> getApprovalSteps() {
        return ResponseEntity.ok(procurementService.getApprovalSteps());
    }

    @PostMapping("/approval-steps")
    public ResponseEntity<ApprovalStepResponse> createApprovalStep(
            @Valid @RequestBody ApprovalStepRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(procurementService.createApprovalStep(request));
    }

    @DeleteMapping("/approval-steps/{id}")
    public ResponseEntity<Void> deleteApprovalStep(@PathVariable Long id) {
        procurementService.deleteApprovalStep(id);
        return ResponseEntity.noContent().build();
    }
}
