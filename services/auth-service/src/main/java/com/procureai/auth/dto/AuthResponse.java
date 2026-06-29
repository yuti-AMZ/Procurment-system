package com.procureai.auth.dto;

import com.procureai.auth.entity.AccountStatus;
import com.procureai.auth.entity.CompanyStatus;
import com.procureai.auth.entity.Role;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private AccountStatus accountStatus;
    private boolean emailVerified;
    private String message;
    private Long companyId;
    private String companyName;
    private CompanyStatus companyStatus;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, Long userId, String email,
                        String firstName, String lastName, Role role,
                        AccountStatus accountStatus, boolean emailVerified, String message) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.accountStatus = accountStatus;
        this.emailVerified = emailVerified;
        this.message = message;
    }

    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Role getRole() { return role; }
    public AccountStatus getAccountStatus() { return accountStatus; }
    public boolean isEmailVerified() { return emailVerified; }
    public String getMessage() { return message; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public CompanyStatus getCompanyStatus() { return companyStatus; }
    public void setCompanyStatus(CompanyStatus companyStatus) { this.companyStatus = companyStatus; }
    public void setToken(String token) { this.token = token; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setEmail(String email) { this.email = email; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setRole(Role role) { this.role = role; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public void setMessage(String message) { this.message = message; }
}
