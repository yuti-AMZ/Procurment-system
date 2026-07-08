package com.procureai.auth.controller;

import com.procureai.auth.dto.*;
import com.procureai.auth.entity.User;
import com.procureai.auth.service.AuthService;
import com.procureai.auth.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CompanyService companyService;

    public AuthController(AuthService authService, CompanyService companyService) {
        this.authService = authService;
        this.companyService = companyService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/register-company")
    public ResponseEntity<AuthResponse> registerCompany(@Valid @RequestBody CompanyRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.registerCompany(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/oauth")
    public ResponseEntity<AuthResponse> oauthLogin(@Valid @RequestBody OAuthLoginRequest request) {
        return ResponseEntity.ok(authService.oauthLogin(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok("If the email exists, a password reset link has been sent.");
    }

    @PostMapping("/admin/approve")
    public ResponseEntity<Map<String, String>> approveUser(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody AdminApprovalRequest request) {
        authService.approveUser(admin.getId(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", request.isApproved() ? "User approved successfully." : "User rejected successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/approve-company")
    public ResponseEntity<Map<String, String>> approveCompany(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody CompanyApprovalRequest request) {
        companyService.approveCompany(admin.getId(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", request.isApproved() ? "Company approved successfully." : "Company rejected successfully.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/toggle-status")
    public ResponseEntity<Map<String, String>> toggleUserStatus(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody ToggleUserStatusRequest request) {
        authService.toggleUserStatus(admin.getId(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", request.isEnabled() ? "User activated successfully." : "User deactivated successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/pending-users")
    public ResponseEntity<List<UserResponse>> getPendingUsers(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(authService.getPendingUsers());
    }

    @PostMapping("/admin/companies")
    public ResponseEntity<CompanyResponse> adminCreateCompany(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody CompanyRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.adminCreateCompany(request));
    }

    @GetMapping("/admin/pending-companies")
    public ResponseEntity<List<CompanyResponse>> getPendingCompanies(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(companyService.getPendingCompanies());
    }

    @GetMapping("/admin/companies")
    public ResponseEntity<List<CompanyResponse>> getAllCompanies(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PostMapping("/company/users")
    public ResponseEntity<UserResponse> inviteCompanyUser(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody CompanyUserInviteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.inviteCompanyUser(admin.getId(), request));
    }

    @GetMapping("/company/users/pending")
    public ResponseEntity<List<UserResponse>> getPendingCompanyUsers(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(companyService.getPendingCompanyUsers(admin.getId()));
    }

    @GetMapping("/company/users")
    public ResponseEntity<List<UserResponse>> getCompanyUsers(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(companyService.getCompanyUsers(admin.getId()));
    }

    @PostMapping("/company/users/approve")
    public ResponseEntity<Map<String, String>> approveCompanyUser(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody AdminApprovalRequest request) {
        companyService.approveCompanyUser(admin.getId(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", request.isApproved() ? "User approved successfully." : "User rejected successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getUserById(user.getId()));
    }
}
