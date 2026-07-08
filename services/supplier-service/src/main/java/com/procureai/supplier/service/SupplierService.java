package com.procureai.supplier.service;

import com.procureai.common.audit.AuditLogger;
import com.procureai.common.event.SupplierEvent;
import com.procureai.common.gate.FeatureGate;
import com.procureai.common.security.TenantContext;
import com.procureai.supplier.dto.*;
import com.procureai.supplier.entity.*;
import com.procureai.supplier.exception.DuplicateSupplierException;
import com.procureai.supplier.exception.SupplierNotFoundException;
import com.procureai.supplier.mapper.SupplierMapper;
import com.procureai.supplier.producer.SupplierEventProducer;
import com.procureai.supplier.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupplierService {

    private final SupplierProfileRepository profileRepository;
    private final TenantSupplierRelationshipRepository relationshipRepository;
    private final SupplierContactRepository contactRepository;
    private final SupplierDocumentRepository documentRepository;
    private final SupplierMapper mapper;
    private final SupplierEventProducer eventProducer;
    private final FeatureGate featureGate;
    private final AuditLogger auditLogger;

    public SupplierService(SupplierProfileRepository profileRepository,
                           TenantSupplierRelationshipRepository relationshipRepository,
                           SupplierContactRepository contactRepository,
                           SupplierDocumentRepository documentRepository,
                           SupplierMapper mapper,
                           SupplierEventProducer eventProducer,
                           FeatureGate featureGate,
                           AuditLogger auditLogger) {
        this.profileRepository = profileRepository;
        this.relationshipRepository = relationshipRepository;
        this.contactRepository = contactRepository;
        this.documentRepository = documentRepository;
        this.mapper = mapper;
        this.eventProducer = eventProducer;
        this.featureGate = featureGate;
        this.auditLogger = auditLogger;
    }

    @Transactional
    public SupplierResponse register(RegisterRequest request) {
        featureGate.require("SUPPLIER_MANAGEMENT");
        Long companyId = TenantContext.getCurrentCompanyId();

        if (profileRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateSupplierException("email", request.getEmail());
        }
        if (profileRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateSupplierException("registrationNumber", request.getRegistrationNumber());
        }

        SupplierProfile profile = mapper.toProfileEntity(request);
        profile = profileRepository.save(profile);

        TenantSupplierRelationship relationship = new TenantSupplierRelationship();
        relationship.setSupplierProfileId(profile.getId());
        relationship.setCompanyId(companyId);
        relationship.setStatus(SupplierStatus.PENDING);
        relationship = relationshipRepository.save(relationship);

        if (request.getPrimaryContactName() != null) {
            SupplierContact contact = mapper.toContactEntity(request, profile.getId());
            contactRepository.save(contact);
        }

        SupplierEvent event = new SupplierEvent("SUPPLIER_REGISTERED", "supplier-service", companyId);
        event.setSupplierId(profile.getId());
        event.setCompanyName(profile.getCompanyName());
        event.setEmail(profile.getEmail());
        event.setStatus(relationship.getStatus().name());
        eventProducer.sendSupplierRegistered(event);

        auditLogger.log("SUPPLIER_REGISTERED", "SupplierProfile", profile.getId(),
                companyId, null, "Supplier registered: " + profile.getCompanyName());

        return mapper.toFullResponse(profile, relationship,
                getContacts(profile.getId()), getDocuments(profile.getId()));
    }

    @Transactional
    public SupplierResponse approve(Long supplierProfileId, ApprovalRequest request, Long approvedBy) {
        featureGate.require("SUPPLIER_MANAGEMENT");
        Long companyId = TenantContext.getCurrentCompanyId();
        TenantSupplierRelationship relationship = relationshipRepository
                .findBySupplierProfileIdAndCompanyId(supplierProfileId, companyId)
                .orElseThrow(() -> new SupplierNotFoundException(supplierProfileId));

        if (relationship.getStatus() != SupplierStatus.PENDING) {
            throw new IllegalStateException("Supplier relationship is not in PENDING state");
        }

        if (request.getApproved()) {
            relationship.setStatus(SupplierStatus.APPROVED);
            relationship.setApprovedBy(approvedBy);
            relationship.setApprovedAt(LocalDateTime.now());
            relationship.setRejectionReason(null);
        } else {
            relationship.setStatus(SupplierStatus.REJECTED);
            relationship.setRejectionReason(request.getRejectionReason());
        }

        relationship = relationshipRepository.save(relationship);

        SupplierProfile profile = profileRepository.findById(supplierProfileId)
                .orElseThrow(() -> new SupplierNotFoundException(supplierProfileId));

        SupplierEvent event = new SupplierEvent(
                request.getApproved() ? "SUPPLIER_APPROVED" : "SUPPLIER_REJECTED",
                "supplier-service", companyId);
        event.setSupplierId(profile.getId());
        event.setCompanyName(profile.getCompanyName());
        event.setEmail(profile.getEmail());
        event.setStatus(relationship.getStatus().name());
        event.setCategory(profile.getCategory());

        if (request.getApproved()) {
            eventProducer.sendSupplierApproved(event);
        } else {
            eventProducer.sendSupplierRejected(event);
        }

        auditLogger.log("SUPPLIER_APPROVED", "SupplierProfile", profile.getId(),
                companyId, approvedBy, "Supplier status: " + relationship.getStatus());

        return mapper.toFullResponse(profile, relationship,
                getContacts(profile.getId()), getDocuments(profile.getId()));
    }

    public SupplierResponse getById(Long id) {
        Long companyId = TenantContext.getCurrentCompanyId();
        TenantSupplierRelationship relationship = relationshipRepository
                .findBySupplierProfileIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new SupplierNotFoundException(id));
        SupplierProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException(id));
        return mapper.toFullResponse(profile, relationship, getContacts(id), getDocuments(id));
    }

    public List<SupplierResponse> getAll(String statusFilter) {
        Long companyId = TenantContext.getCurrentCompanyId();
        List<TenantSupplierRelationship> relationships;
        if (statusFilter != null && !statusFilter.isBlank()) {
            relationships = relationshipRepository
                    .findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId,
                            SupplierStatus.valueOf(statusFilter.toUpperCase()));
        } else {
            relationships = relationshipRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        }

        List<Long> profileIds = relationships.stream()
                .map(TenantSupplierRelationship::getSupplierProfileId)
                .toList();
        var profiles = profileRepository.findByIdIn(profileIds).stream()
                .collect(java.util.stream.Collectors.toMap(SupplierProfile::getId, p -> p));

        return relationships.stream()
                .map(rel -> {
                    SupplierProfile profile = profiles.get(rel.getSupplierProfileId());
                    if (profile == null) return null;
                    return mapper.toResponse(profile, rel);
                })
                .filter(r -> r != null)
                .toList();
    }

    public List<SupplierResponse> getByCategory(String category) {
        Long companyId = TenantContext.getCurrentCompanyId();
        List<SupplierProfile> profiles = profileRepository.findByCategory(category);
        return profiles.stream()
                .map(profile -> {
                    TenantSupplierRelationship relationship = relationshipRepository
                            .findBySupplierProfileIdAndCompanyId(profile.getId(), companyId)
                            .orElse(null);
                    if (relationship == null) return null;
                    return mapper.toResponse(profile, relationship);
                })
                .filter(r -> r != null)
                .toList();
    }

    @Transactional
    public SupplierResponse update(Long id, RegisterRequest request) {
        featureGate.require("SUPPLIER_MANAGEMENT");
        Long companyId = TenantContext.getCurrentCompanyId();
        TenantSupplierRelationship relationship = relationshipRepository
                .findBySupplierProfileIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new SupplierNotFoundException(id));

        SupplierProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException(id));

        if (!profile.getEmail().equals(request.getEmail())
                && profileRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateSupplierException("email", request.getEmail());
        }

        profile.setCompanyName(request.getCompanyName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setCountry(request.getCountry());
        profile.setPostalCode(request.getPostalCode());
        profile.setWebsite(request.getWebsite());
        profile.setTaxId(request.getTaxId());
        profile.setCategory(request.getCategory());
        profile.setDescription(request.getDescription());

        profile = profileRepository.save(profile);

        auditLogger.log("SUPPLIER_UPDATED", "SupplierProfile", id,
                companyId, null, "Supplier updated: " + profile.getCompanyName());

        return mapper.toFullResponse(profile, relationship, getContacts(id), getDocuments(id));
    }

    public long countByStatus(SupplierStatus status) {
        Long companyId = TenantContext.getCurrentCompanyId();
        return relationshipRepository.countByCompanyIdAndStatus(companyId, status);
    }

    private List<SupplierContact> getContacts(Long supplierProfileId) {
        return contactRepository.findBySupplierProfileId(supplierProfileId);
    }

    private List<SupplierDocument> getDocuments(Long supplierProfileId) {
        return documentRepository.findBySupplierProfileId(supplierProfileId);
    }
}
