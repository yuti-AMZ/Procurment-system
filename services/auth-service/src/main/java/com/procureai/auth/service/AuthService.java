package com.procureai.auth.service;

import com.procureai.auth.dto.*;
import com.procureai.auth.entity.AccountStatus;
import com.procureai.auth.entity.Company;
import com.procureai.auth.entity.CompanyStatus;
import com.procureai.auth.entity.Role;
import com.procureai.auth.entity.User;
import com.procureai.auth.repository.CompanyRepository;
import com.procureai.auth.repository.UserRepository;
import com.procureai.auth.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final boolean emailVerificationEnabled;

    public AuthService(UserRepository userRepository,
                       CompanyRepository companyRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       @Value("${app.email-verification-enabled:false}") boolean emailVerificationEnabled) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailVerificationEnabled = emailVerificationEnabled;
    }

    public AuthResponse register(RegisterRequest request) {
        throw new BadCredentialsException(
                "Individual registration is disabled. Please register your organization instead.");
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        checkAccountLockout(user);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled. Contact an administrator.");
        }

        if (emailVerificationEnabled && !user.isEmailVerified()) {
            return new AuthResponse(null, null, user.getId(), user.getEmail(),
                    user.getFirstName(), user.getLastName(), user.getRole(),
                    user.getAccountStatus(), false,
                    "Please verify your email before logging in.");
        }

        if (user.getAccountStatus() == AccountStatus.PENDING_APPROVAL) {
            return buildStatusResponse(user,
                    "Your account is pending admin approval. Please wait for an administrator to approve your account.");
        }

        if (user.getAccountStatus() == AccountStatus.REJECTED) {
            return buildStatusResponse(user,
                    "Your account registration was rejected. Contact an administrator for more information.");
        }

        if (user.getCompanyId() != null) {
            Company company = companyRepository.findById(user.getCompanyId()).orElse(null);
            if (company == null) {
                throw new BadCredentialsException("Organization not found");
            }
            if (company.getStatus() == CompanyStatus.PENDING_APPROVAL) {
                return buildStatusResponse(user,
                        "Your organization is pending platform approval. You will be notified once approved.");
            }
            if (company.getStatus() == CompanyStatus.REJECTED) {
                return buildStatusResponse(user,
                        "Your organization registration was rejected: "
                                + (company.getRejectionReason() != null ? company.getRejectionReason() : "Contact support."));
            }
            if (company.getStatus() == CompanyStatus.SUSPENDED) {
                throw new BadCredentialsException("Your organization has been suspended. Contact support.");
            }
        }

        return issueTokens(user);
    }

    public AuthResponse oauthLogin(OAuthLoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String provider = request.getProvider().trim().toLowerCase();

        if (!provider.equals("google") && !provider.equals("github")) {
            throw new BadCredentialsException("Unsupported OAuth provider: " + provider);
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            if (user.getOauthProvider() != null && !user.getOauthProvider().equals(provider)) {
                throw new BadCredentialsException(
                        "This email is already registered with " + user.getOauthProvider() +
                        ". Please sign in with " + user.getOauthProvider() + ".");
            }
            if (user.getOauthProvider() == null) {
                throw new BadCredentialsException(
                        "This email is already registered with email/password. " +
                        "Please sign in using your password.");
            }
        } else {
            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setFirstName(sanitize(request.getFirstName()));
            user.setLastName(sanitize(request.getLastName()));
            user.setRole(Role.EMPLOYEE);
            user.setAccountStatus(AccountStatus.PENDING_APPROVAL);
            user.setEmailVerified(true);
            user.setOauthProvider(provider);
            user.setOauthId(request.getOauthToken());
            user = userRepository.save(user);
        }

        if (user.getAccountStatus() == AccountStatus.PENDING_APPROVAL) {
            return buildStatusResponse(user,
                    "Your account is pending admin approval. Please wait for an administrator to approve your account.");
        }

        if (user.getAccountStatus() == AccountStatus.REJECTED) {
            return buildStatusResponse(user, "Your account registration was rejected.");
        }

        return issueTokens(user);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        if (!jwtTokenProvider.isRefreshToken(request.getRefreshToken())) {
            throw new BadCredentialsException("Invalid token type");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        return issueTokens(user);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired verification token"));

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    public void requestPasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);
        if (user != null) {
            user.setEmailVerificationToken(UUID.randomUUID().toString());
            userRepository.save(user);
        }
    }

    public void toggleUserStatus(Long adminUserId, ToggleUserStatusRequest request) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new BadCredentialsException("Admin not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new BadCredentialsException("Only administrators can toggle user status");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        user.setEnabled(request.isEnabled());
        if (request.isEnabled()) {
            user.setAccountStatus(AccountStatus.APPROVED);
        }
        // when disabling, keep accountStatus as-is (still APPROVED, just disabled)

        userRepository.save(user);
    }

    public void approveUser(Long adminUserId, AdminApprovalRequest request) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new BadCredentialsException("Admin not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new BadCredentialsException("Only administrators can approve or reject users");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (user.getCompanyId() != null) {
            throw new BadCredentialsException(
                    "Company users are approved by their organization admin, not platform admin.");
        }

        if (request.isApproved()) {
            user.setAccountStatus(AccountStatus.APPROVED);
            user.setEnabled(true);
        } else {
            user.setAccountStatus(AccountStatus.REJECTED);
            user.setEnabled(false);
        }

        userRepository.save(user);
    }

    public List<UserResponse> getPendingUsers() {
        return userRepository.findByAccountStatus(AccountStatus.PENDING_APPROVAL)
                .stream()
                .filter(u -> u.getCompanyId() == null)
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        return toUserResponse(user);
    }

    private void checkAccountLockout(User user) {
        if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
            long minutesRemaining = java.time.Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes();
            throw new BadCredentialsException(
                    "Account is temporarily locked due to too many failed attempts. " +
                    "Please try again in " + minutesRemaining + " minutes.");
        }

        if (user.getLockedUntil() != null && LocalDateTime.now().isAfter(user.getLockedUntil())) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }
    }

    private void handleFailedLogin(User user) {
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

        if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
        }

        userRepository.save(user);
    }

    private UserResponse toUserResponse(User user) {
        String companyName = null;
        if (user.getCompanyId() != null) {
            companyName = companyRepository.findById(user.getCompanyId())
                    .map(Company::getName).orElse(null);
        }
        return new UserResponse(
                user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                user.getRole(), user.getAccountStatus(), user.isEmailVerified(),
                user.isEnabled(), user.getCompanyId(), companyName, user.getCreatedAt());
    }

    private AuthResponse issueTokens(User user) {
        String companyName = null;
        CompanyStatus companyStatus = null;
        if (user.getCompanyId() != null) {
            Company company = companyRepository.findById(user.getCompanyId()).orElse(null);
            if (company != null) {
                companyName = company.getName();
                companyStatus = company.getStatus();
            }
        }

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name(),
                user.getFirstName(), user.getLastName(),
                user.getCompanyId(), companyName);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        AuthResponse resp = new AuthResponse(accessToken, refreshToken, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole(),
                user.getAccountStatus(), user.isEmailVerified(), "Login successful.");
        resp.setCompanyId(user.getCompanyId());
        resp.setCompanyName(companyName);
        resp.setCompanyStatus(companyStatus);
        return resp;
    }

    private AuthResponse buildStatusResponse(User user, String message) {
        AuthResponse resp = new AuthResponse(null, null, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole(),
                user.getAccountStatus(), user.isEmailVerified(), message);
        resp.setCompanyId(user.getCompanyId());
        if (user.getCompanyId() != null) {
            companyRepository.findById(user.getCompanyId()).ifPresent(c -> {
                resp.setCompanyName(c.getName());
                resp.setCompanyStatus(c.getStatus());
            });
        }
        return resp;
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("<[^>]*>", "");
    }
}
