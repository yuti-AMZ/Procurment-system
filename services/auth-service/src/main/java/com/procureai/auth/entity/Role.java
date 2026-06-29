package com.procureai.auth.entity;

public enum Role {
    /** Platform super administrator */
    ADMIN,
    /** Organization owner — manages users within their company */
    COMPANY_ADMIN,
    PROCUREMENT,
    MANAGER,
    EMPLOYEE,
    SUPPLIER
}
