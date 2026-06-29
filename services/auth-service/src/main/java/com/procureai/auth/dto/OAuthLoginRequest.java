package com.procureai.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class OAuthLoginRequest {

    @NotBlank(message = "Provider is required")
    private String provider;

    @NotBlank(message = "OAuth token is required")
    private String oauthToken;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getOauthToken() { return oauthToken; }
    public void setOauthToken(String oauthToken) { this.oauthToken = oauthToken; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}
