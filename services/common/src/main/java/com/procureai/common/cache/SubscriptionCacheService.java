package com.procureai.common.cache;

import com.procureai.common.model.PlanFeatures;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class SubscriptionCacheService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionCacheService.class);
    private static final String KEY_PREFIX = "subscription:features:";
    private static final Duration TTL = Duration.ofMinutes(5);

    private final StringRedisTemplate redisTemplate;

    public SubscriptionCacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public PlanFeatures getFeatures(Long companyId) {
        try {
            String json = redisTemplate.opsForValue().get(key(companyId));
            if (json == null) {
                return PlanFeatures.empty();
            }
            return PlanFeatures.fromJson(json);
        } catch (Exception e) {
            log.warn("Redis unavailable for getFeatures(company={}): {}", companyId, e.getMessage());
            return PlanFeatures.empty();
        }
    }

    public void setFeatures(Long companyId, PlanFeatures features) {
        try {
            redisTemplate.opsForValue().set(key(companyId), features.toJson(), TTL);
        } catch (Exception e) {
            log.warn("Redis unavailable for setFeatures(company={}): {}", companyId, e.getMessage());
        }
    }

    public void invalidate(Long companyId) {
        try {
            redisTemplate.delete(key(companyId));
        } catch (Exception e) {
            log.warn("Redis unavailable for invalidate(company={}): {}", companyId, e.getMessage());
        }
    }

    private static String key(Long companyId) {
        return KEY_PREFIX + companyId;
    }
}
