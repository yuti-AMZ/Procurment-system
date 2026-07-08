package com.procureai.auth.controller;

import com.procureai.auth.dto.AdminDTOs.*;
import com.procureai.auth.service.PlatformAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class PlatformAdminController {

    private final PlatformAdminService service;

    public PlatformAdminController(PlatformAdminService service) { this.service = service; }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(service.getAnalytics());
    }

    // Subscription Plans
    @GetMapping("/plans")
    public ResponseEntity<List<PlanResponse>> listPlans() {
        return ResponseEntity.ok(service.listPlans());
    }
    @PostMapping("/plans")
    public ResponseEntity<PlanResponse> createPlan(@RequestBody PlanRequest req) {
        return ResponseEntity.ok(service.createPlan(req));
    }
    @PutMapping("/plans/{id}")
    public ResponseEntity<PlanResponse> updatePlan(@PathVariable Long id, @RequestBody PlanRequest req) {
        return ResponseEntity.ok(service.updatePlan(id, req));
    }

    // Subscriptions
    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionResponse>> listSubscriptions() {
        return ResponseEntity.ok(service.listSubscriptions());
    }

    // Invoices / Billing
    @GetMapping("/invoices")
    public ResponseEntity<List<InvoiceResponse>> listInvoices() {
        return ResponseEntity.ok(service.listInvoices());
    }

    // Features
    @GetMapping("/features")
    public ResponseEntity<List<FeatureResponse>> listFeatures() {
        return ResponseEntity.ok(service.listFeatures());
    }
    @PutMapping("/features/{id}/toggle")
    public ResponseEntity<FeatureResponse> toggleFeature(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(service.toggleFeature(id, enabled));
    }

    // API Keys
    @GetMapping("/api-keys")
    public ResponseEntity<List<ApiKeyResponse>> listApiKeys() {
        return ResponseEntity.ok(service.listApiKeys());
    }
    @PostMapping("/api-keys/generate")
    public ResponseEntity<ApiKeyResponse> generateApiKey(@RequestParam String name,
                                                          @RequestParam Long companyId,
                                                          @RequestParam Long createdBy) {
        return ResponseEntity.ok(service.generateApiKey(name, companyId, createdBy));
    }
    @PostMapping("/api-keys/{id}/revoke")
    public ResponseEntity<Void> revokeApiKey(@PathVariable Long id) {
        service.revokeApiKey(id);
        return ResponseEntity.ok().build();
    }

    // Webhooks
    @GetMapping("/webhooks")
    public ResponseEntity<List<WebhookResponse>> listWebhooks() {
        return ResponseEntity.ok(service.listWebhooks());
    }
    @PostMapping("/webhooks")
    public ResponseEntity<WebhookResponse> createWebhook(@RequestBody WebhookRequest req) {
        return ResponseEntity.ok(service.createWebhook(req));
    }
    @PutMapping("/webhooks/{id}/status")
    public ResponseEntity<Void> toggleWebhook(@PathVariable Long id, @RequestParam String status) {
        service.toggleWebhook(id, status);
        return ResponseEntity.ok().build();
    }

    // Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLogResponse>> listAuditLogs() {
        return ResponseEntity.ok(service.listAuditLogs());
    }

    // Settings
    @GetMapping("/settings")
    public ResponseEntity<List<SettingResponse>> listSettings() {
        return ResponseEntity.ok(service.listSettings());
    }
    @PutMapping("/settings")
    public ResponseEntity<SettingResponse> updateSetting(@RequestBody SettingRequest req) {
        return ResponseEntity.ok(service.updateSetting(req));
    }

    // Support Tickets
    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> listTickets() {
        return ResponseEntity.ok(service.listTickets());
    }
    @PostMapping("/tickets")
    public ResponseEntity<TicketResponse> createTicket(@RequestBody TicketRequest req) {
        return ResponseEntity.ok(service.createTicket(req));
    }
    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(@PathVariable Long id,
                                                              @RequestParam String status,
                                                              @RequestParam(required = false) String resolution) {
        return ResponseEntity.ok(service.updateTicketStatus(id, status, resolution));
    }
}
