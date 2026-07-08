package com.procureai.auth.service;

import com.procureai.auth.dto.AdminDTOs.ApiKeyResponse;
import com.procureai.auth.entity.ApiKey;
import com.procureai.auth.repository.ApiKeyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ApiKeyService {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyService.class);
    private static final String REDIS_KEY_PREFIX = "apikey:";
    private static final String RAW_KEY_PREFIX = "sk_live_";
    private static final Duration CACHE_TTL = Duration.ofHours(24);

    private final ApiKeyRepository apiKeyRepo;
    private final StringRedisTemplate redisTemplate;

    public ApiKeyService(ApiKeyRepository apiKeyRepo, StringRedisTemplate redisTemplate) {
        this.apiKeyRepo = apiKeyRepo;
        this.redisTemplate = redisTemplate;
    }

    @Transactional
    public ApiKeyResult generateApiKey(String name, Long companyId, Long createdBy, String scopes) {
        String rawKey = RAW_KEY_PREFIX + UUID.randomUUID().toString().replace("-", "");
        String keyHash = sha256(rawKey);
        String keyPrefix = rawKey.substring(0, 12) + "...";

        ApiKey key = new ApiKey();
        key.setName(name);
        key.setCompanyId(companyId);
        key.setCreatedBy(createdBy);
        key.setKeyHash(keyHash);
        key.setKeyPrefix(keyPrefix);
        key.setRateLimit(1000);
        key.setScopes(scopes != null ? scopes : "read,write");
        key.setStatus("ACTIVE");
        apiKeyRepo.save(key);

        cacheApiKey(keyHash, companyId, key.getRateLimit(), key.getScopes());

        log.info("API key generated: name={}, companyId={}, prefix={}, scopes={}", name, companyId, keyPrefix, key.getScopes());

        ApiKeyResponse response = toApiKeyResponse(key);
        return new ApiKeyResult(response, rawKey);
    }

    public List<ApiKeyResponse> listApiKeys(Long companyId) {
        return apiKeyRepo.findByCompanyId(companyId).stream()
                .map(this::toApiKeyResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeApiKey(Long id, Long companyId) {
        ApiKey key = apiKeyRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("API key not found: " + id));
        if (!key.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("API key does not belong to this company");
        }
        key.setStatus("REVOKED");
        apiKeyRepo.save(key);
        evictApiKey(key.getKeyHash());
        log.info("API key revoked: id={}, companyId={}", id, companyId);
    }

    public ApiKeyAuthResult authenticate(String rawKey) {
        if (rawKey == null || !rawKey.startsWith(RAW_KEY_PREFIX)) {
            return null;
        }

        String keyHash = sha256(rawKey);

        String cached = redisTemplate.opsForValue().get(REDIS_KEY_PREFIX + keyHash);
        if (cached != null) {
            String[] parts = cached.split(":");
            Long companyId = Long.parseLong(parts[0]);
            int rateLimit = parts.length > 1 ? Integer.parseInt(parts[1]) : 1000;
            String scopes = parts.length > 2 ? parts[2] : "read";
            touchLastUsed(keyHash);
            return new ApiKeyAuthResult(companyId, rateLimit, scopes);
        }

        return apiKeyRepo.findByKeyHash(keyHash)
                .filter(k -> "ACTIVE".equals(k.getStatus()))
                .map(k -> {
                    cacheApiKey(keyHash, k.getCompanyId(), k.getRateLimit(), k.getScopes());
                    touchLastUsed(keyHash);
                    return new ApiKeyAuthResult(k.getCompanyId(), k.getRateLimit(), k.getScopes());
                })
                .orElse(null);
    }

    private void cacheApiKey(String keyHash, Long companyId, Integer rateLimit, String scopes) {
        String value = companyId + ":" + (rateLimit != null ? rateLimit : 1000) + ":" + (scopes != null ? scopes : "read");
        redisTemplate.opsForValue().set(REDIS_KEY_PREFIX + keyHash, value, CACHE_TTL);
    }

    private void evictApiKey(String keyHash) {
        redisTemplate.delete(REDIS_KEY_PREFIX + keyHash);
    }

    private void touchLastUsed(String keyHash) {
        apiKeyRepo.findByKeyHash(keyHash).ifPresent(key -> {
            key.setLastUsedAt(LocalDateTime.now());
            apiKeyRepo.save(key);
        });
    }

    static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private ApiKeyResponse toApiKeyResponse(ApiKey k) {
        ApiKeyResponse r = new ApiKeyResponse();
        r.id = k.getId();
        r.name = k.getName();
        r.keyPrefix = k.getKeyPrefix();
        r.companyId = k.getCompanyId();
        r.status = k.getStatus();
        r.rateLimit = k.getRateLimit();
        r.scopes = k.getScopes();
        r.lastUsedAt = k.getLastUsedAt();
        r.createdAt = k.getCreatedAt();
        return r;
    }

    public record ApiKeyResult(ApiKeyResponse response, String rawKey) {}
    public record ApiKeyAuthResult(Long companyId, int rateLimit, String scopes) {}
}
