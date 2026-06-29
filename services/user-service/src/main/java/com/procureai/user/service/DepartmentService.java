package com.procureai.user.service;

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

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Department already exists");
        }
        Department dept = new Department(request.getName(), request.getDescription());
        dept = departmentRepository.save(dept);
        return toResponse(dept);
    }

    public DepartmentResponse getDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        return toResponse(dept);
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        dept.setName(request.getName());
        dept.setDescription(request.getDescription());
        dept = departmentRepository.save(dept);
        return toResponse(dept);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    private DepartmentResponse toResponse(Department dept) {
        return new DepartmentResponse(dept.getId(), dept.getName(), dept.getDescription());
    }
}
