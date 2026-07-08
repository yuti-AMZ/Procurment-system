package com.procureai.auth.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AdminDTOs {
    public static class PlanRequest {
        public String name;
        public String description;
        public BigDecimal price;
        public String currency;
        public String interval;
        public String features;
        public boolean active = true;
    }

    public static class PlanResponse {
        public Long id;
        public String name;
        public String description;
        public BigDecimal price;
        public String currency;
        public String interval;
        public String features;
        public boolean active;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;
    }

    public static class SubscriptionResponse {
        public Long id;
        public Long companyId;
        public String companyName;
        public Long planId;
        public String planName;
        public BigDecimal price;
        public String currency;
        public String status;
        public LocalDate startDate;
        public LocalDate endDate;
        public boolean autoRenew;
        public LocalDateTime createdAt;
    }

    public static class InvoiceResponse {
        public Long id;
        public Long companyId;
        public String companyName;
        public Long subscriptionId;
        public String invoiceNumber;
        public BigDecimal amount;
        public String currency;
        public String status;
        public String description;
        public LocalDate dueDate;
        public LocalDate paidAt;
        public LocalDateTime createdAt;
    }

    public static class FeatureRequest {
        public String featureKey;
        public String name;
        public String description;
        public boolean enabled;
        public String category;
    }

    public static class FeatureResponse {
        public Long id;
        public String featureKey;
        public String name;
        public String description;
        public boolean enabled;
        public String category;
        public LocalDateTime createdAt;
    }

    public static class ApiKeyResponse {
        public Long id;
        public String name;
        public String keyPrefix;
        public Long companyId;
        public String status;
        public Integer rateLimit;
        public String scopes;
        public LocalDateTime lastUsedAt;
        public LocalDateTime createdAt;
    }

    public static class WebhookRequest {
        public String name;
        public String url;
        public List<String> events;
        public String secret;
    }

    public static class WebhookResponse {
        public Long id;
        public String name;
        public String url;
        public Long companyId;
        public String events;
        public String status;
        public LocalDateTime createdAt;
    }

    public static class AuditLogResponse {
        public Long id;
        public Long userId;
        public String userEmail;
        public String action;
        public String resource;
        public String resourceId;
        public String detail;
        public Long companyId;
        public LocalDateTime timestamp;
    }

    public static class SettingRequest {
        public String settingKey;
        public String settingValue;
        public String description;
    }

    public static class SettingResponse {
        public Long id;
        public String settingKey;
        public String settingValue;
        public String description;
        public LocalDateTime updatedAt;
    }

    public static class TicketRequest {
        public String subject;
        public String description;
        public String priority;
        public Long companyId;
        public String companyName;
        public Long createdBy;
        public String createdByEmail;
    }

    public static class TicketResponse {
        public Long id;
        public String subject;
        public String description;
        public String priority;
        public String status;
        public Long companyId;
        public String companyName;
        public Long createdBy;
        public String createdByEmail;
        public Long assignedTo;
        public String resolution;
        public LocalDateTime createdAt;
        public LocalDateTime updatedAt;
    }

    public static class AnalyticsResponse {
        public long totalOrganizations;
        public long pendingOrganizations;
        public long activeOrganizations;
        public long totalUsers;
        public long pendingUsers;
        public long activeUsers;
        public long totalPurchaseRequests;
        public long totalPurchaseOrders;
        public long activeSuppliers;
        public long totalInvoices;
        public long mrr;
        public long activeSubscriptions;
    }

    public static class PlatformDashboardResponse {
        public long totalCompanies;
        public long pendingCompanies;
        public long approvedCompanies;
        public long suspendedCompanies;
        public long totalUsers;
        public long activeUsers;
        public long totalSubscriptions;
        public long activeSubscriptions;
        public long totalInvoices;
        public long paidInvoices;
        public BigDecimal totalRevenue;
        public BigDecimal collectedRevenue;
        public BigDecimal mrr;
    }

    public static class RevenueOverviewResponse {
        public long totalSubscriptions;
        public long activeSubscriptions;
        public long totalInvoices;
        public long paidInvoices;
        public long overdueInvoices;
        public BigDecimal totalRevenue;
        public BigDecimal collectedRevenue;
        public BigDecimal mrr;
    }

    public static class ServiceHealthResponse {
        public String service;
        public String url;
        public String status;
        public int statusCode;
        public long responseTimeMs;
    }
}
