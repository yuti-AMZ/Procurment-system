package com.procureai.user.service;

import com.procureai.common.gate.FeatureGate;
import com.procureai.common.security.TenantContext;
import com.procureai.user.dto.DepartmentRequest;
import com.procureai.user.dto.DepartmentResponse;
import com.procureai.user.entity.Department;
import com.procureai.user.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final FeatureGate featureGate;

    public DepartmentService(DepartmentRepository departmentRepository, FeatureGate featureGate) {
        this.departmentRepository = departmentRepository;
        this.featureGate = featureGate;
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {
        featureGate.require("DEPARTMENTS");
        Long companyId = TenantContext.getCurrentCompanyId();
        if (departmentRepository.existsByNameAndCompanyId(request.getName(), companyId)) {
            throw new IllegalArgumentException("Department already exists");
        }
        Department dept = new Department(request.getName(), request.getDescription());
        dept.setCompanyId(companyId);
        dept = departmentRepository.save(dept);
        return toResponse(dept);
    }

    public DepartmentResponse getDepartment(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Department dept = departmentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return toResponse(dept);
    }

    public List<DepartmentResponse> getAllDepartments() {
        Long companyId = TenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new IllegalStateException("No tenant context.");
        }
        return departmentRepository.findByCompanyIdOrderByNameAsc(companyId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Department dept = departmentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        dept = departmentRepository.save(dept);
        return toResponse(dept);
    }

    public void deleteDepartment(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        Department dept = departmentRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        departmentRepository.deleteById(dept.getId());
    }

    private DepartmentResponse toResponse(Department dept) {
        return new DepartmentResponse(dept.getId(), dept.getName(), dept.getDescription());
    }
}
