package com.procureai.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration:3600000}") long accessExpiration,
            @Value("${jwt.refresh-token-expiration:604800000}") long refreshExpiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessExpiration;
        this.refreshTokenExpiration = refreshExpiration;
    }

    public String generateAccessToken(Long userId, String email, String role,
                                      String firstName, String lastName,
                                      Long companyId, String companyName) {
        Date now = new Date();
        var builder = Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .claim("firstName", firstName)
                .claim("lastName", lastName)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenExpiration));
        if (companyId != null) {
            builder.claim("companyId", companyId);
        }
        if (companyName != null) {
            builder.claim("companyName", companyName);
        }
        return builder.signWith(key).compact();
    }

    public String generateAccessToken(Long userId, String email, String role, String firstName, String lastName) {
        return generateAccessToken(userId, email, role, firstName, lastName, null, null);
    }

    public String generateRefreshToken(Long userId, String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshTokenExpiration))
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateTokenWithDetails(String token) {
        try {
            Claims claims = parseToken(token);
            if (claims.getExpiration() != null && claims.getExpiration().before(new Date())) {
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        return parseToken(token).get("userId", Long.class);
    }

    public String getEmailFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        return parseToken(token).get("role", String.class);
    }

    public String getFirstNameFromToken(String token) {
        return parseToken(token).get("firstName", String.class);
    }

    public String getLastNameFromToken(String token) {
        return parseToken(token).get("lastName", String.class);
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(parseToken(token).get("type"));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
