package com.procureai.auth.controller;

import com.procureai.auth.dto.AdminDTOs.ApiKeyResponse;
import com.procureai.auth.service.ApiKeyService;
import com.procureai.auth.service.ApiKeyService.ApiKeyResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/apikeys")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> generateApiKey(
            @RequestHeader("X-Company-Id") Long companyId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        String scopes = body.get("scopes");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ApiKeyResult result = apiKeyService.generateApiKey(name, companyId, userId, scopes);
        return ResponseEntity.ok(Map.of(
                "key", result.rawKey(),
                "details", result.response()
        ));
    }

    @GetMapping
    public ResponseEntity<List<ApiKeyResponse>> listApiKeys(
            @RequestHeader("X-Company-Id") Long companyId) {
        return ResponseEntity.ok(apiKeyService.listApiKeys(companyId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeApiKey(
            @PathVariable Long id,
            @RequestHeader("X-Company-Id") Long companyId) {
        apiKeyService.revokeApiKey(id, companyId);
        return ResponseEntity.noContent().build();
    }
}
