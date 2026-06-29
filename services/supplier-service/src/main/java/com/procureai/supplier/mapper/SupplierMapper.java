package com.procureai.supplier.mapper;

import com.procureai.supplier.dto.*;
import com.procureai.supplier.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SupplierMapper {

    public Supplier toEntity(RegisterRequest request) {
        Supplier supplier = new Supplier();
        supplier.setCompanyName(request.getCompanyName());
        supplier.setRegistrationNumber(request.getRegistrationNumber());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setCountry(request.getCountry());
        supplier.setPostalCode(request.getPostalCode());
        supplier.setWebsite(request.getWebsite());
        supplier.setTaxId(request.getTaxId());
        supplier.setCategory(request.getCategory());
        supplier.setDescription(request.getDescription());
        return supplier;
    }

    public SupplierResponse toResponse(Supplier supplier) {
        SupplierResponse resp = new SupplierResponse();
        resp.setId(supplier.getId());
        resp.setCompanyName(supplier.getCompanyName());
        resp.setRegistrationNumber(supplier.getRegistrationNumber());
        resp.setEmail(supplier.getEmail());
        resp.setPhone(supplier.getPhone());
        resp.setAddress(supplier.getAddress());
        resp.setCity(supplier.getCity());
        resp.setCountry(supplier.getCountry());
        resp.setPostalCode(supplier.getPostalCode());
        resp.setWebsite(supplier.getWebsite());
        resp.setTaxId(supplier.getTaxId());
        resp.setCategory(supplier.getCategory());
        resp.setDescription(supplier.getDescription());
        resp.setStatus(supplier.getStatus());
        resp.setApprovedBy(supplier.getApprovedBy());
        resp.setApprovedAt(supplier.getApprovedAt());
        resp.setRejectionReason(supplier.getRejectionReason());
        resp.setCreatedAt(supplier.getCreatedAt());
        resp.setUpdatedAt(supplier.getUpdatedAt());
        return resp;
    }

    public SupplierResponse toFullResponse(Supplier supplier,
                                            List<SupplierContact> contacts,
                                            List<SupplierDocument> docs) {
        SupplierResponse resp = toResponse(supplier);
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

    public SupplierContact toContactEntity(RegisterRequest request, Long supplierId) {
        SupplierContact contact = new SupplierContact();
        contact.setSupplierId(supplierId);
        contact.setFullName(request.getPrimaryContactName());
        contact.setEmail(request.getPrimaryContactEmail());
        contact.setPhone(request.getPrimaryContactPhone());
        contact.setPosition(request.getPrimaryContactPosition());
        contact.setIsPrimary(true);
        return contact;
    }
}
