package com.procureai.common.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AuditLogger {

    private static final Logger log = LoggerFactory.getLogger(AuditLogger.class);
    private static final String AUDIT_KEY = "audit:events";
    private static final int MAX_EVENTS = 10000;

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public AuditLogger(StringRedisTemplate redis, ObjectMapper objectMapper) {
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    public void log(String action, String entityType, Long entityId,
                    Long companyId, Long userId, String details) {
        try {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("timestamp", Instant.now().toString());
            event.put("action", action);
            event.put("entityType", entityType);
            event.put("entityId", entityId);
            event.put("companyId", companyId);
            event.put("userId", userId);
            event.put("details", details);
            redis.opsForList().rightPush(AUDIT_KEY, objectMapper.writeValueAsString(event));
            redis.opsForList().trim(AUDIT_KEY, -MAX_EVENTS, -1);
        } catch (Exception e) {
            log.error("Failed to write audit event: action={}, entityType={}, entityId={}", action, entityType, entityId, e);
        }
    }
}
