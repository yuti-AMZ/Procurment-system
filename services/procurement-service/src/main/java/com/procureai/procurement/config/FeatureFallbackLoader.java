package com.procureai.procurement.config;

import com.procureai.common.cache.SubscriptionCacheService;
import com.procureai.common.model.PlanFeatures;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

@Service
public class FeatureFallbackLoader {

    private static final Logger log = LoggerFactory.getLogger(FeatureFallbackLoader.class);

    private final SubscriptionCacheService cache;
    private final DataSource authDataSource;

    public FeatureFallbackLoader(SubscriptionCacheService cache,
                                  @Qualifier("authDataSource") DataSource authDataSource) {
        this.cache = cache;
        this.authDataSource = authDataSource;
    }

    public PlanFeatures getFeaturesWithFallback(Long companyId) {
        PlanFeatures features = cache.getFeatures(companyId);
        if (!features.getFeatures().isEmpty()) {
            return features;
        }

        log.info("Cache miss for company={}, loading from DB", companyId);

        try (Connection conn = authDataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "SELECT sp.features FROM organization_subscriptions os " +
                "JOIN subscription_plans sp ON sp.id = os.plan_id " +
                "WHERE os.company_id = ? AND os.status = 'ACTIVE' LIMIT 1");
            ps.setLong(1, companyId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String featuresStr = rs.getString("features");
                Map<String, Boolean> featureMap = new HashMap<>();
                for (String f : featuresStr.split(",")) {
                    featureMap.put(f.trim(), true);
                }
                features = new PlanFeatures(featureMap);
                cache.setFeatures(companyId, features);
                log.info("Loaded features for company={}: {}", companyId, featureMap.keySet());
            } else {
                log.warn("No active subscription for company={}", companyId);
            }
        } catch (Exception e) {
            log.error("Failed to load features for company={}: {}", companyId, e.getMessage());
        }

        return features;
    }
}
