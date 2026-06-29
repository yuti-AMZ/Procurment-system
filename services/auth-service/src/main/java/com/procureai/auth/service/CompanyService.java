package com.procureai.auth.service;

import com.procureai.auth.dto.*;
import com.procureai.auth.entity.*;
import com.procureai.auth.repository.CompanyRepository;
import com.procureai.auth.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private static final Set<Role> COMPANY_INVITABLE_ROLES = Set.of(
            Role.MANAGER, Role.EMPLOYEE, Role.PROCUREMENT, Role.SUPPLIER);

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(CompanyRepository companyRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse registerCompany(CompanyRegisterRequest request) {
        String companyEmail = request.getCompanyEmail().trim().toLowerCase();
        String adminEmail = request.getAdminEmail().trim().toLowerCase();

        if (companyRepository.existsByEmail(companyEmail)) {
            throw new BadCredentialsException("A company with this email already exists");
        }
        if (companyRepository.existsByRegistrationNumber(request.getRegistrationNumber().trim())) {
            throw new BadCredentialsException("A company with this registration number already exists");
        }
        if (userRepository.existsByEmail(adminEmail)) {
            throw new BadCredentialsException("An account with this admin email already exists");
        }

        Company company = new Company();
        company.setName(sanitize(request.getCompanyName()));
        company.setRegistrationNumber(request.getRegistrationNumber().trim());
        company.setEmail(companyEmail);
        company.setPhone(sanitize(request.getPhone()));
        company.setAddress(sanitize(request.getAddress()));
        company.setCity(sanitize(request.getCity()));
        company.setCountry(sanitize(request.getCountry()));
        company.setIndustry(sanitize(request.getIndustry()));
        company.setStatus(CompanyStatus.PENDING_APPROVAL);
        company = companyRepository.save(company);

        User admin = new User(
                adminEmail,
                passwordEncoder.encode(request.getAdminPassword()),
                sanitize(request.getAdminFirstName()),
                sanitize(request.getAdminLastName()),
                Role.COMPANY_ADMIN
        );
        admin.setCompanyId(company.getId());
        admin.setAccountStatus(AccountStatus.PENDING_APPROVAL);
        admin.setEmailVerified(true);
        admin = userRepository.save(admin);

        return buildPendingResponse(admin, company,
                "Company registration submitted. A platform administrator will review your organization before you can log in.");
    }

    @Transactional
    public void approveCompany(Long superAdminId, CompanyApprovalRequest request) {
        User superAdmin = requireSuperAdmin(superAdminId);

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new BadCredentialsException("Company not found"));

        if (request.isApproved()) {
            company.setStatus(CompanyStatus.APPROVED);
            company.setRejectionReason(null);
            companyRepository.save(company);

            userRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId()).stream()
                    .filter(u -> u.getRole() == Role.COMPANY_ADMIN)
                    .findFirst()
                    .ifPresent(admin -> {
                        admin.setAccountStatus(AccountStatus.APPROVED);
                        admin.setEnabled(true);
                        userRepository.save(admin);
                    });
        } else {
            company.setStatus(CompanyStatus.REJECTED);
            company.setRejectionReason(request.getRejectionReason());
            companyRepository.save(company);

            userRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId()).forEach(u -> {
                u.setAccountStatus(AccountStatus.REJECTED);
                u.setEnabled(false);
                userRepository.save(u);
            });
        }
    }

    public List<CompanyResponse> getPendingCompanies() {
        return companyRepository.findByStatusOrderByCreatedAtDesc(CompanyStatus.PENDING_APPROVAL)
                .stream()
                .map(this::toCompanyResponse)
                .collect(Collectors.toList());
    }

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::toCompanyResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse inviteCompanyUser(Long companyAdminId, CompanyUserInviteRequest request) {
        User admin = userRepository.findById(companyAdminId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        requireCompanyAdmin(admin);

        if (request.getRole() == Role.ADMIN || request.getRole() == Role.COMPANY_ADMIN) {
            throw new BadCredentialsException("Cannot invite users with admin roles");
        }
        if (!COMPANY_INVITABLE_ROLES.contains(request.getRole())) {
            throw new BadCredentialsException("Invalid role for company user");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadCredentialsException("An account with this email already exists");
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                sanitize(request.getFirstName()),
                sanitize(request.getLastName()),
                request.getRole()
        );
        user.setCompanyId(admin.getCompanyId());
        user.setAccountStatus(AccountStatus.PENDING_APPROVAL);
        user.setEmailVerified(true);
        user = userRepository.save(user);

        return toUserResponse(user);
    }

    @Transactional
    public void approveCompanyUser(Long companyAdminId, AdminApprovalRequest request) {
        User admin = userRepository.findById(companyAdminId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        requireCompanyAdmin(admin);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!admin.getCompanyId().equals(user.getCompanyId())) {
            throw new BadCredentialsException("You can only approve users in your organization");
        }
        if (user.getRole() == Role.COMPANY_ADMIN) {
            throw new BadCredentialsException("Cannot approve company admin through this endpoint");
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

    public List<UserResponse> getPendingCompanyUsers(Long companyAdminId) {
        User admin = userRepository.findById(companyAdminId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        requireCompanyAdmin(admin);

        return userRepository.findByCompanyIdAndAccountStatus(
                        admin.getCompanyId(), AccountStatus.PENDING_APPROVAL)
                .stream()
                .filter(u -> u.getRole() != Role.COMPANY_ADMIN)
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getCompanyUsers(Long companyAdminId) {
        User admin = userRepository.findById(companyAdminId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        requireCompanyAdmin(admin);

        return userRepository.findByCompanyIdOrderByCreatedAtDesc(admin.getCompanyId())
                .stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public Company requireApprovedCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BadCredentialsException("Company not found"));
        if (company.getStatus() != CompanyStatus.APPROVED) {
            throw new BadCredentialsException("Your organization is not active. Status: " + company.getStatus());
        }
        return company;
    }

    private User requireSuperAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new BadCredentialsException("Only platform administrators can perform this action");
        }
        return user;
    }

    private void requireCompanyAdmin(User user) {
        if (user.getRole() != Role.COMPANY_ADMIN || user.getCompanyId() == null) {
            throw new BadCredentialsException("Only company administrators can perform this action");
        }
        requireApprovedCompany(user.getCompanyId());
    }

    private CompanyResponse toCompanyResponse(Company company) {
        CompanyResponse resp = new CompanyResponse();
        resp.setId(company.getId());
        resp.setName(company.getName());
        resp.setRegistrationNumber(company.getRegistrationNumber());
        resp.setEmail(company.getEmail());
        resp.setPhone(company.getPhone());
        resp.setAddress(company.getAddress());
        resp.setCity(company.getCity());
        resp.setCountry(company.getCountry());
        resp.setIndustry(company.getIndustry());
        resp.setStatus(company.getStatus());
        resp.setRejectionReason(company.getRejectionReason());
        resp.setCreatedAt(company.getCreatedAt());

        userRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId()).stream()
                .filter(u -> u.getRole() == Role.COMPANY_ADMIN)
                .findFirst()
                .ifPresent(admin -> {
                    resp.setAdminName(admin.getFirstName() + " " + admin.getLastName());
                    resp.setAdminEmail(admin.getEmail());
                });
        return resp;
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

    private AuthResponse buildPendingResponse(User user, Company company, String message) {
        AuthResponse resp = new AuthResponse(null, null, user.getId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole(),
                user.getAccountStatus(), user.isEmailVerified(), message);
        resp.setCompanyId(company.getId());
        resp.setCompanyName(company.getName());
        resp.setCompanyStatus(company.getStatus());
        return resp;
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("<[^>]*>", "");
    }
}
