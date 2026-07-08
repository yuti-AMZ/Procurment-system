package com.procureai.auth.controller;

import com.procureai.auth.dto.AdminDTOs.*;
import com.procureai.auth.dto.CompanyResponse;
import com.procureai.auth.service.PlatformAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platform/admin")
public class PlatformAdminDashboardController {

    private final PlatformAdminService service;

    public PlatformAdminDashboardController(PlatformAdminService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<PlatformDashboardResponse> getDashboard() {
        return ResponseEntity.ok(service.getPlatformDashboard());
    }

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyResponse>> listCompanies() {
        return ResponseEntity.ok(service.listCompanies());
    }

    @PutMapping("/companies/{id}/approve")
    public ResponseEntity<CompanyResponse> approveCompany(@PathVariable Long id) {
        return ResponseEntity.ok(service.approveCompany(id));
    }

    @PutMapping("/companies/{id}/suspend")
    public ResponseEntity<CompanyResponse> suspendCompany(@PathVariable Long id) {
        return ResponseEntity.ok(service.suspendCompany(id));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<RevenueOverviewResponse> revenueOverview() {
        return ResponseEntity.ok(service.getRevenueOverview());
    }

    @GetMapping("/system/health")
    public ResponseEntity<List<ServiceHealthResponse>> getSystemHealth() {
        return ResponseEntity.ok(service.getSystemHealth());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> listAuditLogs() {
        return ResponseEntity.ok(service.listAuditLogs());
    }

    @PostMapping("/plans")
    public ResponseEntity<PlanResponse> createPlan(@RequestBody PlanRequest req) {
        return ResponseEntity.ok(service.createPlan(req));
    }
}