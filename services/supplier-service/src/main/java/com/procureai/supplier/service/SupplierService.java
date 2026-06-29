package com.procureai.supplier.service;

import com.procureai.common.event.SupplierEvent;
import com.procureai.supplier.dto.*;
import com.procureai.supplier.entity.*;
import com.procureai.supplier.exception.DuplicateSupplierException;
import com.procureai.supplier.exception.SupplierNotFoundException;
import com.procureai.supplier.mapper.SupplierMapper;
import com.procureai.supplier.producer.SupplierEventProducer;
import com.procureai.supplier.repository.SupplierContactRepository;
import com.procureai.supplier.repository.SupplierDocumentRepository;
import com.procureai.supplier.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierContactRepository contactRepository;
    private final SupplierDocumentRepository documentRepository;
    private final SupplierMapper mapper;
    private final SupplierEventProducer eventProducer;

    public SupplierService(SupplierRepository supplierRepository,
                           SupplierContactRepository contactRepository,
                           SupplierDocumentRepository documentRepository,
                           SupplierMapper mapper,
                           SupplierEventProducer eventProducer) {
        this.supplierRepository = supplierRepository;
        this.contactRepository = contactRepository;
        this.documentRepository = documentRepository;
        this.mapper = mapper;
        this.eventProducer = eventProducer;
    }

    @Transactional
    public SupplierResponse register(RegisterRequest request) {
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateSupplierException("email", request.getEmail());
        }
        if (supplierRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateSupplierException("registrationNumber", request.getRegistrationNumber());
        }

        Supplier supplier = mapper.toEntity(request);
        supplier.setStatus(SupplierStatus.PENDING);
        supplier = supplierRepository.save(supplier);

        if (request.getPrimaryContactName() != null) {
            SupplierContact contact = mapper.toContactEntity(request, supplier.getId());
            contactRepository.save(contact);
        }

        SupplierEvent event = new SupplierEvent("SUPPLIER_REGISTERED", "supplier-service");
        event.setSupplierId(supplier.getId());
        event.setCompanyName(supplier.getCompanyName());
        event.setEmail(supplier.getEmail());
        event.setStatus(supplier.getStatus().name());
        eventProducer.sendSupplierRegistered(event);

        return mapper.toFullResponse(supplier, getContacts(supplier.getId()), getDocuments(supplier.getId()));
    }

    @Transactional
    public SupplierResponse approve(Long supplierId, ApprovalRequest request, Long approvedBy) {
        Supplier supplier = findById(supplierId);
        if (supplier.getStatus() != SupplierStatus.PENDING) {
            throw new IllegalStateException("Supplier is not in PENDING state");
        }

        if (request.getApproved()) {
            supplier.setStatus(SupplierStatus.APPROVED);
            supplier.setApprovedBy(approvedBy);
            supplier.setApprovedAt(LocalDateTime.now());
            supplier.setRejectionReason(null);
        } else {
            supplier.setStatus(SupplierStatus.REJECTED);
            supplier.setRejectionReason(request.getRejectionReason());
        }

        supplier = supplierRepository.save(supplier);

        SupplierEvent event = new SupplierEvent(
                request.getApproved() ? "SUPPLIER_APPROVED" : "SUPPLIER_REJECTED",
                "supplier-service");
        event.setSupplierId(supplier.getId());
        event.setCompanyName(supplier.getCompanyName());
        event.setEmail(supplier.getEmail());
        event.setStatus(supplier.getStatus().name());
        event.setCategory(supplier.getCategory());

        if (request.getApproved()) {
            eventProducer.sendSupplierApproved(event);
        } else {
            eventProducer.sendSupplierRejected(event);
        }

        return mapper.toFullResponse(supplier, getContacts(supplier.getId()), getDocuments(supplier.getId()));
    }

    public SupplierResponse getById(Long id) {
        Supplier supplier = findById(id);
        return mapper.toFullResponse(supplier, getContacts(id), getDocuments(id));
    }

    public List<SupplierResponse> getAll(String statusFilter) {
        List<Supplier> suppliers;
        if (statusFilter != null && !statusFilter.isBlank()) {
            suppliers = supplierRepository.findByStatus(SupplierStatus.valueOf(statusFilter.toUpperCase()));
        } else {
            suppliers = supplierRepository.findAll();
        }
        return suppliers.stream().map(mapper::toResponse).toList();
    }

    public List<SupplierResponse> getByCategory(String category) {
        return supplierRepository.findByCategory(category).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public SupplierResponse update(Long id, RegisterRequest request) {
        Supplier supplier = findById(id);

        if (!supplier.getEmail().equals(request.getEmail())
                && supplierRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateSupplierException("email", request.getEmail());
        }

        supplier.setCompanyName(request.getCompanyName());
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

        supplier = supplierRepository.save(supplier);
        return mapper.toFullResponse(supplier, getContacts(id), getDocuments(id));
    }

    public long countByStatus(SupplierStatus status) {
        return supplierRepository.findByStatus(status).size();
    }

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException(id));
    }

    private List<SupplierContact> getContacts(Long supplierId) {
        return contactRepository.findBySupplierId(supplierId);
    }

    private List<SupplierDocument> getDocuments(Long supplierId) {
        return documentRepository.findBySupplierId(supplierId);
    }
}
