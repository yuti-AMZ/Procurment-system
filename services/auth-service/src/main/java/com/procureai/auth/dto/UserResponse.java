package com.procureai.auth.dto;

import com.procureai.auth.entity.AccountStatus;
import com.procureai.auth.entity.Role;
import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private AccountStatus accountStatus;
    private boolean emailVerified;
    private boolean enabled;
    private Long companyId;
    private String companyName;
    private LocalDateTime createdAt;

    public UserResponse(Long id, String email, String firstName, String lastName,
                        Role role, AccountStatus accountStatus, boolean emailVerified,
                        boolean enabled, Long companyId, String companyName, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.accountStatus = accountStatus;
        this.emailVerified = emailVerified;
        this.enabled = enabled;
        this.companyId = companyId;
        this.companyName = companyName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Role getRole() { return role; }
    public AccountStatus getAccountStatus() { return accountStatus; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isEnabled() { return enabled; }
    public Long getCompanyId() { return companyId; }
    public String getCompanyName() { return companyName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
