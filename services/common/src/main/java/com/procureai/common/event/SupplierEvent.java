package com.procureai.common.event;

public class SupplierEvent extends BaseEvent {
    private Long supplierId;
    private String companyName;
    private String registrationNumber;
    private String email;
    private String status;
    private String category;

    public SupplierEvent() {}

    public SupplierEvent(String eventType, String source) {
        super(eventType, source);
    }

    public SupplierEvent(String eventType, String source, Long companyId) {
        super(eventType, source, companyId);
    }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
