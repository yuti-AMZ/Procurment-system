package com.procureai.auth.cache;

import com.procureai.auth.entity.OrganizationSubscription;
import com.procureai.auth.entity.SubscriptionPlan;
import com.procureai.auth.repository.OrganizationSubscriptionRepository;
import com.procureai.auth.repository.SubscriptionPlanRepository;
import com.procureai.common.cache.SubscriptionCacheService;
import com.procureai.common.model.PlanFeatures;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class FeatureCacheService {

    private static final Logger log = LoggerFactory.getLogger(FeatureCacheService.class);

    private final SubscriptionPlanRepository planRepo;
    private final OrganizationSubscriptionRepository subRepo;
    private final SubscriptionCacheService cache;

    public FeatureCacheService(SubscriptionPlanRepository planRepo,
                               OrganizationSubscriptionRepository subRepo,
                               SubscriptionCacheService cache) {
        this.planRepo = planRepo;
        this.subRepo = subRepo;
        this.cache = cache;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void warmCache() {
        try {
            log.info("Warming subscription feature cache...");
            List<OrganizationSubscription> activeSubs = subRepo.findByStatus("ACTIVE");
            for (OrganizationSubscription sub : activeSubs) {
                try {
                    refreshCompany(sub.getCompanyId());
                } catch (Exception e) {
                    log.warn("Failed to warm cache for company {}: {}", sub.getCompanyId(), e.getMessage());
                }
            }
            log.info("Feature cache warmed for {} companies", activeSubs.size());
        } catch (Exception e) {
            log.warn("Redis unavailable, feature cache will warm on first request: {}", e.getMessage());
        }
    }

    public void refreshCompany(Long companyId) {
        Optional<OrganizationSubscription> subOpt = subRepo.findTopByCompanyIdOrderByCreatedAtDesc(companyId);
        if (subOpt.isEmpty()) {
            cache.invalidate(companyId);
            return;
        }
        OrganizationSubscription sub = subOpt.get();
        Optional<SubscriptionPlan> planOpt = planRepo.findById(sub.getPlanId());
        if (planOpt.isEmpty()) {
            cache.invalidate(companyId);
            return;
        }
        SubscriptionPlan plan = planOpt.get();
        PlanFeatures features = resolveFeatures(plan);
        cache.setFeatures(companyId, features);
        log.debug("Cached features for company {}: {}", companyId, features.getFeatures().keySet());
    }

    public void refreshAll() {
        List<OrganizationSubscription> subs = subRepo.findByStatus("ACTIVE");
        for (OrganizationSubscription sub : subs) {
            refreshCompany(sub.getCompanyId());
        }
    }

    private PlanFeatures resolveFeatures(SubscriptionPlan plan) {
        PlanFeatures features = new PlanFeatures();
        String raw = plan.getFeatures();
        if (raw == null || raw.isBlank()) return features;
        Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(features::enable);
        return features;
    }
}
