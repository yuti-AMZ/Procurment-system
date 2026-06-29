package com.procureai.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class GatewayTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String userId = request.getHeader("X-User-Id");
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");
        String firstName = request.getHeader("X-User-First-Name");
        String lastName = request.getHeader("X-User-Last-Name");
        String companyIdHeader = request.getHeader("X-Company-Id");

        if (StringUtils.hasText(userId) && StringUtils.hasText(email) && StringUtils.hasText(role)) {
            try {
                Long companyId = StringUtils.hasText(companyIdHeader) ? Long.parseLong(companyIdHeader) : null;
                GatewayAuthenticationToken auth = new GatewayAuthenticationToken(
                        Long.parseLong(userId), email, role, firstName, lastName, companyId);
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (NumberFormatException ignored) {}
        }

        filterChain.doFilter(request, response);
    }
}
