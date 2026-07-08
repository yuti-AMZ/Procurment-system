package com.procureai.supplier.mapper;

import com.procureai.supplier.dto.*;
import com.procureai.supplier.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SupplierMapper {

    public SupplierProfile toProfileEntity(RegisterRequest request) {
        SupplierProfile profile = new SupplierProfile();
        profile.setCompanyName(request.getCompanyName());
        profile.setRegistrationNumber(request.getRegistrationNumber());
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
        return profile;
    }

    public SupplierResponse toResponse(SupplierProfile profile, TenantSupplierRelationship relationship) {
        SupplierResponse resp = new SupplierResponse();
        resp.setId(profile.getId());
        resp.setCompanyName(profile.getCompanyName());
        resp.setRegistrationNumber(profile.getRegistrationNumber());
        resp.setEmail(profile.getEmail());
        resp.setPhone(profile.getPhone());
        resp.setAddress(profile.getAddress());
        resp.setCity(profile.getCity());
        resp.setCountry(profile.getCountry());
        resp.setPostalCode(profile.getPostalCode());
        resp.setWebsite(profile.getWebsite());
        resp.setTaxId(profile.getTaxId());
        resp.setCategory(profile.getCategory());
        resp.setDescription(profile.getDescription());
        resp.setStatus(relationship.getStatus());
        resp.setApprovedBy(relationship.getApprovedBy());
        resp.setApprovedAt(relationship.getApprovedAt());
        resp.setRejectionReason(relationship.getRejectionReason());
        resp.setCreatedAt(relationship.getCreatedAt());
        resp.setUpdatedAt(relationship.getUpdatedAt());
        return resp;
    }

    public SupplierResponse toFullResponse(SupplierProfile profile,
                                           TenantSupplierRelationship relationship,
                                           List<SupplierContact> contacts,
                                           List<SupplierDocument> docs) {
        SupplierResponse resp = toResponse(profile, relationship);
        if (contacts != null) {
            resp.setContacts(contacts.stream().map(this::toContactResponse).collect(Collectors.toList()));
        }
        if (docs != null) {
            resp.setDocuments(docs.stream().map(this::toDocumentResponse).collect(Collectors.toList()));
        }
        return resp;
    }

    public SupplierContactResponse toContactResponse(SupplierContact contact) {
        SupplierContactResponse r = new SupplierContactResponse();
        r.setId(contact.getId());
        r.setFullName(contact.getFullName());
        r.setEmail(contact.getEmail());
        r.setPhone(contact.getPhone());
        r.setPosition(contact.getPosition());
        r.setIsPrimary(contact.getIsPrimary());
        return r;
    }

    public SupplierDocumentResponse toDocumentResponse(SupplierDocument doc) {
        SupplierDocumentResponse r = new SupplierDocumentResponse();
        r.setId(doc.getId());
        r.setDocumentName(doc.getDocumentName());
        r.setDocumentType(doc.getDocumentType());
        r.setUploadedAt(doc.getUploadedAt());
        return r;
    }

    public SupplierContact toContactEntity(RegisterRequest request, Long supplierProfileId) {
        SupplierContact contact = new SupplierContact();
        contact.setSupplierProfileId(supplierProfileId);
        contact.setFullName(request.getPrimaryContactName());
        contact.setEmail(request.getPrimaryContactEmail());
        contact.setPhone(request.getPrimaryContactPhone());
        contact.setPosition(request.getPrimaryContactPosition());
        contact.setIsPrimary(true);
        return contact;
    }
}
