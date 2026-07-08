package com.procureai.user.service;

import com.procureai.common.gate.FeatureGate;
import com.procureai.common.security.TenantContext;
import com.procureai.user.dto.CreateUserRequest;
import com.procureai.user.dto.UserResponse;
import com.procureai.user.entity.Department;
import com.procureai.user.entity.User;
import com.procureai.user.repository.DepartmentRepository;
import com.procureai.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FeatureGate featureGate;

    public UserService(UserRepository userRepository, DepartmentRepository departmentRepository,
                       FeatureGate featureGate) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.featureGate = featureGate;
    }

    public UserResponse createUser(CreateUserRequest request) {
        featureGate.require("USER_MANAGEMENT");
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Long companyId = TenantContext.getCurrentCompanyId();

        User user = new User();
        user.setId(request.getId());
        user.setCompanyId(companyId);
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setJobTitle(request.getJobTitle());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            user.setDepartment(dept);
        }

        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserResponse getUser(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        User user;
        if (companyId != null) {
            user = userRepository.findByIdAndCompanyId(id, companyId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        } else {
            // Super admin path — no tenant scoping
            user = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
        return toResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new IllegalStateException("No tenant context. Use the Super Admin API for platform-wide user queries.");
        }
        return userRepository.findByCompanyId(companyId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getUsersByRole(String role) {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new IllegalStateException("No tenant context.");
        }
        return userRepository.findByCompanyIdAndRole(companyId,
                com.procureai.user.entity.UserRole.valueOf(role.toUpperCase()))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getUsersByDepartment(Long departmentId) {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new IllegalStateException("No tenant context.");
        }
        return userRepository.findByCompanyIdAndDepartmentId(companyId, departmentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse updateUser(Long id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setJobTitle(request.getJobTitle());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            user.setDepartment(dept);
        }

        user = userRepository.save(user);
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                user.getRole(), user.getPhone(), user.getJobTitle(),
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getDepartment() != null ? user.getDepartment().getName() : null
        );
    }
}
