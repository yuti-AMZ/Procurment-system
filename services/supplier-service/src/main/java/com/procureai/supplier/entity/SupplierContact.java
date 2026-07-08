package com.procureai.supplier.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "supplier_contacts")
public class SupplierContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_profile_id", nullable = false)
    private Long supplierProfileId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String position;

    private Boolean isPrimary;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSupplierProfileId() { return supplierProfileId; }
    public void setSupplierProfileId(Long supplierProfileId) { this.supplierProfileId = supplierProfileId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
}
