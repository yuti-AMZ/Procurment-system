package com.procureai.procurement.entity.auth;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "organization_subscriptions")
public class OrgSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "plan_name")
    private String planName;

    private String status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public Long getCompanyId() { return companyId; }
    public Long getPlanId() { return planId; }
    public String getPlanName() { return planName; }
    public String getStatus() { return status; }
}
