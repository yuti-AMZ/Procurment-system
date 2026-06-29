package com.procureai.user.repository;

import com.procureai.user.entity.User;
import com.procureai.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(UserRole role);
    List<User> findByDepartmentId(Long departmentId);
    boolean existsByEmail(String email);
}
