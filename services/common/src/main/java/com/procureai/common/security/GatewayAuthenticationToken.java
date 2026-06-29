package com.procureai.common.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class GatewayAuthenticationToken extends AbstractAuthenticationToken {

    private final Long userId;
    private final String email;
    private final String role;
    private final String firstName;
    private final String lastName;
    private final Long companyId;

    public GatewayAuthenticationToken(Long userId, String email, String role,
                                      String firstName, String lastName, Long companyId) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.companyId = companyId;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return email;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Long getCompanyId() { return companyId; }
}
