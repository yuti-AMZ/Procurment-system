package com.procureai.auth.service;

import com.procureai.auth.cache.FeatureCacheService;
import com.procureai.auth.dto.AdminDTOs.*;
import com.procureai.auth.dto.CompanyResponse;
import com.procureai.auth.entity.*;
import com.procureai.auth.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PlatformAdminService {

    private final SubscriptionPlanRepository planRepo;
    private final OrganizationSubscriptionRepository subRepo;
    private final InvoiceRepository invoiceRepo;
    private final PlatformFeatureRepository featureRepo;
    private final ApiKeyRepository apiKeyRepo;
    private final WebhookRepository webhookRepo;
    private final AuditLogRepository auditLogRepo;
    private final PlatformSettingRepository settingRepo;
    private final SupportTicketRepository ticketRepo;
    private final CompanyRepository companyRepo;
    private final UserRepository userRepo;
    private final FeatureCacheService featureCache;

    public PlatformAdminService(SubscriptionPlanRepository planRepo,
            OrganizationSubscriptionRepository subRepo,
            InvoiceRepository invoiceRepo,
            PlatformFeatureRepository featureRepo,
            ApiKeyRepository apiKeyRepo,
            WebhookRepository webhookRepo,
            AuditLogRepository auditLogRepo,
            PlatformSettingRepository settingRepo,
            SupportTicketRepository ticketRepo,
            CompanyRepository companyRepo,
            UserRepository userRepo,
            FeatureCacheService featureCache) {
        this.planRepo = planRepo;
        this.subRepo = subRepo;
        this.invoiceRepo = invoiceRepo;
        this.featureRepo = featureRepo;
        this.apiKeyRepo = apiKeyRepo;
        this.webhookRepo = webhookRepo;
        this.auditLogRepo = auditLogRepo;
        this.settingRepo = settingRepo;
        this.ticketRepo = ticketRepo;
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
        this.featureCache = featureCache;
    }

    // ========== Subscriptions ==========
    public List<PlanResponse> listPlans() {
        return planRepo.findAll().stream().map(this::toPlanResponse).collect(Collectors.toList());
    }

    public PlanResponse createPlan(PlanRequest req) {
        SubscriptionPlan p = new SubscriptionPlan();
        p.setName(req.name);
        p.setDescription(req.description);
        p.setPrice(req.price);
        p.setCurrency(req.currency != null ? req.currency : "USD");
        p.setInterval(req.interval);
        p.setFeatures(req.features);
        p.setActive(req.active);
        PlanResponse resp = toPlanResponse(planRepo.save(p));
        featureCache.refreshAll();
        return resp;
    }

    public PlanResponse updatePlan(Long id, PlanRequest req) {
        SubscriptionPlan p = planRepo.findById(id).orElseThrow();
        p.setName(req.name);
        p.setDescription(req.description);
        p.setPrice(req.price);
        p.setCurrency(req.currency);
        p.setInterval(req.interval);
        p.setFeatures(req.features);
        p.setActive(req.active);
        PlanResponse resp = toPlanResponse(planRepo.save(p));
        featureCache.refreshAll();
        return resp;
    }

    public List<SubscriptionResponse> listSubscriptions() {
        return subRepo.findAll().stream().map(s -> {
            SubscriptionResponse r = new SubscriptionResponse();
            r.id = s.getId();
            r.companyId = s.getCompanyId();
            companyRepo.findById(s.getCompanyId()).ifPresent(c -> r.companyName = c.getName());
            r.planId = s.getPlanId();
            r.planName = s.getPlanName();
            r.price = s.getPrice();
            r.currency = s.getCurrency();
            r.status = s.getStatus();
            r.startDate = s.getStartDate();
            r.endDate = s.getEndDate();
            r.autoRenew = s.isAutoRenew();
            r.createdAt = s.getCreatedAt();
            return r;
        }).collect(Collectors.toList());
    }

    private PlanResponse toPlanResponse(SubscriptionPlan p) {
        PlanResponse r = new PlanResponse();
        r.id = p.getId();
        r.name = p.getName();
        r.description = p.getDescription();
        r.price = p.getPrice();
        r.currency = p.getCurrency();
        r.interval = p.getInterval();
        r.features = p.getFeatures();
        r.active = p.isActive();
        r.createdAt = p.getCreatedAt();
        r.updatedAt = p.getUpdatedAt();
        return r;
    }

    // ========== Billing ==========
    public List<InvoiceResponse> listInvoices() {
        return invoiceRepo.findAll().stream().map(inv -> {
            InvoiceResponse r = new InvoiceResponse();
            r.id = inv.getId();
            r.companyId = inv.getCompanyId();
            companyRepo.findById(inv.getCompanyId()).ifPresent(c -> r.companyName = c.getName());
            r.subscriptionId = inv.getSubscriptionId();
            r.invoiceNumber = inv.getInvoiceNumber();
            r.amount = inv.getAmount();
            r.currency = inv.getCurrency();
            r.status = inv.getStatus();
            r.description = inv.getDescription();
            r.dueDate = inv.getDueDate();
            r.paidAt = inv.getPaidAt();
            r.createdAt = inv.getCreatedAt();
            return r;
        }).collect(Collectors.toList());
    }

    // ========== Features ==========
    public List<FeatureResponse> listFeatures() {
        return featureRepo.findAll().stream().map(this::toFeatureResponse).collect(Collectors.toList());
    }

    public FeatureResponse toggleFeature(Long id, boolean enabled) {
        PlatformFeature f = featureRepo.findById(id).orElseThrow();
        f.setEnabled(enabled);
        FeatureResponse resp = toFeatureResponse(featureRepo.save(f));
        featureCache.refreshAll();
        return resp;
    }

    private FeatureResponse toFeatureResponse(PlatformFeature f) {
        FeatureResponse r = new FeatureResponse();
        r.id = f.getId();
        r.featureKey = f.getFeatureKey();
        r.name = f.getName();
        r.description = f.getDescription();
        r.enabled = f.isEnabled();
        r.category = f.getCategory();
        r.createdAt = f.getCreatedAt();
        return r;
    }

    // ========== API Keys ==========
    public List<ApiKeyResponse> listApiKeys() {
        return apiKeyRepo.findAll().stream().map(this::toApiKeyResponse).collect(Collectors.toList());
    }

    @Transactional
    public ApiKeyResponse generateApiKey(String name, Long companyId, Long createdBy) {
        ApiKey key = new ApiKey();
        key.setName(name);
        key.setCompanyId(companyId);
        key.setCreatedBy(createdBy);
        key.setKeyPrefix("pk_" + UUID.randomUUID().toString().substring(0, 8));
        key.setKeyHash(UUID.randomUUID().toString() + UUID.randomUUID().toString());
        key.setRateLimit(1000);
        return toApiKeyResponse(apiKeyRepo.save(key));
    }

    public void revokeApiKey(Long id) {
        ApiKey key = apiKeyRepo.findById(id).orElseThrow();
        key.setStatus("REVOKED");
        apiKeyRepo.save(key);
    }

    private ApiKeyResponse toApiKeyResponse(ApiKey k) {
        ApiKeyResponse r = new ApiKeyResponse();
        r.id = k.getId();
        r.name = k.getName();
        r.keyPrefix = k.getKeyPrefix();
        r.companyId = k.getCompanyId();
        r.status = k.getStatus();
        r.rateLimit = k.getRateLimit();
        r.lastUsedAt = k.getLastUsedAt();
        r.createdAt = k.getCreatedAt();
        return r;
    }

    // ========== Webhooks ==========
    public List<WebhookResponse> listWebhooks() {
        return webhookRepo.findAll().stream().map(this::toWebhookResponse).collect(Collectors.toList());
    }

    public WebhookResponse createWebhook(WebhookRequest req) {
        Webhook w = new Webhook();
        w.setName(req.name);
        w.setUrl(req.url);
        w.setEvents(String.join(",", req.events));
        w.setSecret(req.secret);
        return toWebhookResponse(webhookRepo.save(w));
    }

    public void toggleWebhook(Long id, String status) {
        Webhook w = webhookRepo.findById(id).orElseThrow();
        w.setStatus(status);
        webhookRepo.save(w);
    }

    private WebhookResponse toWebhookResponse(Webhook w) {
        WebhookResponse r = new WebhookResponse();
        r.id = w.getId();
        r.name = w.getName();
        r.url = w.getUrl();
        r.companyId = w.getCompanyId();
        r.events = w.getEvents();
        r.status = w.getStatus();
        r.createdAt = w.getCreatedAt();
        return r;
    }

    // ========== Audit Logs ==========
    public List<AuditLogResponse> listAuditLogs() {
        return auditLogRepo.findAllByOrderByTimestampDesc().stream().map(this::toAuditLogResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse toAuditLogResponse(AuditLog a) {
        AuditLogResponse r = new AuditLogResponse();
        r.id = a.getId();
        r.userId = a.getUserId();
        r.userEmail = a.getUserEmail();
        r.action = a.getAction();
        r.resource = a.getResource();
        r.resourceId = a.getResourceId();
        r.detail = a.getDetail();
        r.companyId = a.getCompanyId();
        r.timestamp = a.getTimestamp();
        return r;
    }

    // ========== Settings ==========
    public List<SettingResponse> listSettings() {
        return settingRepo.findAll().stream().map(this::toSettingResponse).collect(Collectors.toList());
    }

    public SettingResponse updateSetting(SettingRequest req) {
        PlatformSetting s = settingRepo.findBySettingKey(req.settingKey).orElseGet(PlatformSetting::new);
        s.setSettingKey(req.settingKey);
        s.setSettingValue(req.settingValue);
        s.setDescription(req.description);
        return toSettingResponse(settingRepo.save(s));
    }

    private SettingResponse toSettingResponse(PlatformSetting s) {
        SettingResponse r = new SettingResponse();
        r.id = s.getId();
        r.settingKey = s.getSettingKey();
        r.settingValue = s.getSettingValue();
        r.description = s.getDescription();
        r.updatedAt = s.getUpdatedAt();
        return r;
    }

    // ========== Support Tickets ==========
    public List<TicketResponse> listTickets() {
        return ticketRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toTicketResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse createTicket(TicketRequest req) {
        SupportTicket t = new SupportTicket();
        t.setSubject(req.subject);
        t.setDescription(req.description);
        t.setPriority(req.priority);
        t.setCompanyId(req.companyId);
        t.setCompanyName(req.companyName);
        t.setCreatedBy(req.createdBy);
        t.setCreatedByEmail(req.createdByEmail);
        return toTicketResponse(ticketRepo.save(t));
    }

    public TicketResponse updateTicketStatus(Long id, String status, String resolution) {
        SupportTicket t = ticketRepo.findById(id).orElseThrow();
        t.setStatus(status);
        if (resolution != null)
            t.setResolution(resolution);
        return toTicketResponse(ticketRepo.save(t));
    }

    private TicketResponse toTicketResponse(SupportTicket t) {
        TicketResponse r = new TicketResponse();
        r.id = t.getId();
        r.subject = t.getSubject();
        r.description = t.getDescription();
        r.priority = t.getPriority();
        r.status = t.getStatus();
        r.companyId = t.getCompanyId();
        r.companyName = t.getCompanyName();
        r.createdBy = t.getCreatedBy();
        r.createdByEmail = t.getCreatedByEmail();
        r.assignedTo = t.getAssignedTo();
        r.resolution = t.getResolution();
        r.createdAt = t.getCreatedAt();
        r.updatedAt = t.getUpdatedAt();
        return r;
    }

    // ========== Platform Admin ==========
    public PlatformDashboardResponse getPlatformDashboard() {
        PlatformDashboardResponse response = new PlatformDashboardResponse();
        List<Company> companies = companyRepo.findAll();
        List<Invoice> invoices = invoiceRepo.findAll();
        List<OrganizationSubscription> subscriptions = subRepo.findAll();

        response.totalCompanies = companies.size();
        response.pendingCompanies = companyRepo.countByStatus(CompanyStatus.PENDING_APPROVAL);
        response.approvedCompanies = companyRepo.countByStatus(CompanyStatus.APPROVED);
        response.suspendedCompanies = companyRepo.countByStatus(CompanyStatus.SUSPENDED);

        response.totalUsers = userRepo.count();
        response.activeUsers = userRepo.findAll().stream().filter(User::isEnabled).count();

        response.totalSubscriptions = subscriptions.size();
        response.activeSubscriptions = subRepo.countByStatus("ACTIVE");

        response.totalInvoices = invoices.size();
        response.paidInvoices = invoiceRepo.countByStatus("PAID");
        response.totalRevenue = sumAmounts(invoices);
        response.collectedRevenue = invoices.stream()
                .filter(inv -> "PAID".equalsIgnoreCase(inv.getStatus()))
                .map(Invoice::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.mrr = subscriptions.stream()
                .filter(sub -> "ACTIVE".equalsIgnoreCase(sub.getStatus()))
                .map(OrganizationSubscription::getPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return response;
    }

    public List<CompanyResponse> listCompanies() {
        return companyRepo.findAll().stream().map(this::toCompanyResponse).collect(Collectors.toList());
    }

    @Transactional
    public CompanyResponse approveCompany(Long companyId) {
        Company company = companyRepo.findById(companyId).orElseThrow();
        company.setStatus(CompanyStatus.APPROVED);
        company.setRejectionReason(null);
        Company saved = companyRepo.save(company);
        provisionDefaultSubscription(saved);
        return toCompanyResponse(saved);
    }

    private void provisionDefaultSubscription(Company company) {
        SubscriptionPlan freeTrialPlan = planRepo.findByNameIgnoreCase("Free Trial")
                .orElseGet(() -> {
                    SubscriptionPlan plan = new SubscriptionPlan();
                    plan.setName("Free Trial");
                    plan.setDescription("30-day free trial with limited features");
                    plan.setPrice(BigDecimal.ZERO);
                    plan.setCurrency("USD");
                    plan.setInterval("MONTHLY");
                    plan.setFeatures("USER_MANAGEMENT,PURCHASE_REQUESTS,APPROVAL_WORKFLOW,REPORTING");
                    plan.setActive(true);
                    return planRepo.save(plan);
                });

        OrganizationSubscription subscription = new OrganizationSubscription();
        subscription.setCompanyId(company.getId());
        subscription.setPlanId(freeTrialPlan.getId());
        subscription.setPlanName(freeTrialPlan.getName());
        subscription.setPrice(freeTrialPlan.getPrice());
        subscription.setCurrency(freeTrialPlan.getCurrency());
        subscription.setStatus("ACTIVE");
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusDays(30));
        subscription.setAutoRenew(false);
        subRepo.save(subscription);

        company.setMaxUsers(5);
        company.setMaxPurchaseRequestsPerMonth(10);
        companyRepo.save(company);

        featureCache.refreshCompany(company.getId());
    }

    @Transactional
    public CompanyResponse suspendCompany(Long companyId) {
        Company company = companyRepo.findById(companyId).orElseThrow();
        company.setStatus(CompanyStatus.SUSPENDED);
        return toCompanyResponse(companyRepo.save(company));
    }

    public RevenueOverviewResponse getRevenueOverview() {
        RevenueOverviewResponse response = new RevenueOverviewResponse();
        List<Invoice> invoices = invoiceRepo.findAll();
        List<OrganizationSubscription> subscriptions = subRepo.findAll();

        response.totalSubscriptions = subscriptions.size();
        response.activeSubscriptions = subRepo.countByStatus("ACTIVE");
        response.totalInvoices = invoices.size();
        response.paidInvoices = invoiceRepo.countByStatus("PAID");
        response.overdueInvoices = invoiceRepo.countByStatus("OVERDUE");
        response.totalRevenue = sumAmounts(invoices);
        response.collectedRevenue = invoices.stream()
                .filter(inv -> "PAID".equalsIgnoreCase(inv.getStatus()))
                .map(Invoice::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.mrr = subscriptions.stream()
                .filter(sub -> "ACTIVE".equalsIgnoreCase(sub.getStatus()))
                .map(OrganizationSubscription::getPrice)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return response;
    }

    @org.springframework.beans.factory.annotation.Value("${service.gateway.url:http://localhost:8082}") private String gatewayUrl;
    @org.springframework.beans.factory.annotation.Value("${service.auth.url:http://localhost:8081}") private String authUrl;
    @org.springframework.beans.factory.annotation.Value("${service.user.url:http://localhost:8090}") private String userUrl;
    @org.springframework.beans.factory.annotation.Value("${service.procurement.url:http://localhost:8088}") private String procurementUrl;
    @org.springframework.beans.factory.annotation.Value("${service.rfq.url:http://localhost:8083}") private String rfqUrl;
    @org.springframework.beans.factory.annotation.Value("${service.quotation.url:http://localhost:8084}") private String quotationUrl;
    @org.springframework.beans.factory.annotation.Value("${service.supplier.url:http://localhost:8085}") private String supplierUrl;
    @org.springframework.beans.factory.annotation.Value("${service.invoice.url:http://localhost:8086}") private String invoiceUrl;
    @org.springframework.beans.factory.annotation.Value("${service.notification.url:http://localhost:8087}") private String notificationUrl;
    @org.springframework.beans.factory.annotation.Value("${service.ocr.url:http://localhost:8091}") private String ocrUrl;
    @org.springframework.beans.factory.annotation.Value("${service.ai.url:http://localhost:8000}") private String aiUrl;

    public List<ServiceHealthResponse> getSystemHealth() {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .build();

        List<ServiceTarget> targets = List.of(
                new ServiceTarget("gateway", gatewayUrl + "/actuator/health"),
                new ServiceTarget("auth-service", authUrl + "/actuator/health"),
                new ServiceTarget("user-service", userUrl + "/actuator/health"),
                new ServiceTarget("procurement-service", procurementUrl + "/actuator/health"),
                new ServiceTarget("rfq-service", rfqUrl + "/actuator/health"),
                new ServiceTarget("quotation-service", quotationUrl + "/actuator/health"),
                new ServiceTarget("supplier-service", supplierUrl + "/actuator/health"),
                new ServiceTarget("invoice-service", invoiceUrl + "/actuator/health"),
                new ServiceTarget("notification-service", notificationUrl + "/actuator/health"),
                new ServiceTarget("ocr-service", ocrUrl + "/actuator/health"),
                new ServiceTarget("ai-service", aiUrl + "/actuator/health"));

        List<ServiceHealthResponse> responses = new ArrayList<>();
        for (ServiceTarget target : targets) {
            ServiceHealthResponse response = new ServiceHealthResponse();
            response.service = target.name;
            response.url = target.url;
            long started = System.nanoTime();
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(target.url))
                        .timeout(Duration.ofSeconds(2))
                        .GET()
                        .build();
                HttpResponse<String> health = client.send(request, HttpResponse.BodyHandlers.ofString());
                response.statusCode = health.statusCode();
                response.status = health.statusCode() >= 200 && health.statusCode() < 300 ? "UP" : "DOWN";
            } catch (Exception ignored) {
                response.statusCode = 0;
                response.status = "DOWN";
            }
            response.responseTimeMs = (System.nanoTime() - started) / 1_000_000;
            responses.add(response);
        }
        return responses;
    }

    private CompanyResponse toCompanyResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setId(company.getId());
        response.setName(company.getName());
        response.setRegistrationNumber(company.getRegistrationNumber());
        response.setEmail(company.getEmail());
        response.setPhone(company.getPhone());
        response.setAddress(company.getAddress());
        response.setCity(company.getCity());
        response.setCountry(company.getCountry());
        response.setIndustry(company.getIndustry());
        response.setLogoUrl(company.getLogoUrl());
        response.setPrimaryColor(company.getPrimaryColor());
        response.setSecondaryColor(company.getSecondaryColor());
        response.setFaviconUrl(company.getFaviconUrl());
        response.setLanguage(company.getLanguage());
        response.setCurrency(company.getCurrency());
        response.setTimezone(company.getTimezone());
        response.setDateFormat(company.getDateFormat());
        response.setSubdomain(company.getSubdomain());
        response.setCustomDomain(company.getCustomDomain());
        response.setMaxUsers(company.getMaxUsers());
        response.setMaxPurchaseRequestsPerMonth(company.getMaxPurchaseRequestsPerMonth());
        response.setStatus(company.getStatus());
        response.setRejectionReason(company.getRejectionReason());
        response.setCreatedAt(company.getCreatedAt());

        userRepo.findByCompanyIdOrderByCreatedAtDesc(company.getId()).stream()
                .filter(u -> u.getRole() == Role.COMPANY_ADMIN)
                .findFirst()
                .ifPresent(admin -> {
                    response.setAdminName(admin.getFirstName() + " " + admin.getLastName());
                    response.setAdminEmail(admin.getEmail());
                });
        return response;
    }

    private BigDecimal sumAmounts(List<Invoice> invoices) {
        return invoices.stream()
                .map(Invoice::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static class ServiceTarget {
        private final String name;
        private final String url;

        private ServiceTarget(String name, String url) {
            this.name = name;
            this.url = url;
        }
    }

    // ========== Analytics ==========
    public AnalyticsResponse getAnalytics() {
        AnalyticsResponse r = new AnalyticsResponse();
        List<Company> companies = companyRepo.findAll();
        r.totalOrganizations = companies.size();
        r.pendingOrganizations = companies.stream().filter(c -> c.getStatus() == CompanyStatus.PENDING_APPROVAL)
                .count();
        r.activeOrganizations = companies.stream().filter(c -> c.getStatus() == CompanyStatus.APPROVED).count();

        List<User> users = userRepo.findAll();
        r.totalUsers = users.size();
        r.pendingUsers = users.stream().filter(u -> u.getAccountStatus() == AccountStatus.PENDING_APPROVAL).count();
        r.activeUsers = users.stream().filter(u -> u.getAccountStatus() == AccountStatus.APPROVED).count();

        r.activeSuppliers = 0;
        r.totalPurchaseRequests = 0;
        r.totalPurchaseOrders = 0;
        r.totalInvoices = invoiceRepo.countByStatus("PAID") + invoiceRepo.countByStatus("PENDING");

        List<OrganizationSubscription> activeSubs = subRepo.findByStatus("ACTIVE");
        r.activeSubscriptions = activeSubs.size();
        r.mrr = activeSubs.stream()
                .filter(s -> s.getPrice() != null)
                .map(s -> "YEARLY".equals(s.getCurrency())
                        ? s.getPrice().divide(BigDecimal.valueOf(12), BigDecimal.ROUND_HALF_UP)
                        : s.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(BigDecimal.valueOf(100)).longValue();

        return r;
    }
}
