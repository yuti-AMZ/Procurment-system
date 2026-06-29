package com.procureai.user.dto;

import com.procureai.user.entity.UserRole;

public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String phone;
    private String jobTitle;
    private Long departmentId;
    private String departmentName;

    public UserResponse(Long id, String email, String firstName, String lastName, UserRole role,
                        String phone, String jobTitle, Long departmentId, String departmentName) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.phone = phone;
        this.jobTitle = jobTitle;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public UserRole getRole() { return role; }
    public String getPhone() { return phone; }
    public String getJobTitle() { return jobTitle; }
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
}
