package com.procureai.common.gate;

import com.procureai.common.cache.SubscriptionCacheService;
import com.procureai.common.exception.FeatureNotAvailableException;
import com.procureai.common.model.PlanFeatures;
import com.procureai.common.security.TenantContext;
import org.springframework.stereotype.Component;

@Component
public class FeatureGate {

    private final SubscriptionCacheService subscriptionCache;

    public FeatureGate(SubscriptionCacheService subscriptionCache) {
        this.subscriptionCache = subscriptionCache;
    }

    public void require(String feature) {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId == null) return;
        PlanFeatures features = subscriptionCache.getFeatures(companyId);
        if (!features.isEnabled(feature)) {
            throw new FeatureNotAvailableException(feature);
        }
    }
}
