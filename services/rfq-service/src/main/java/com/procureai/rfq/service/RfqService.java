package com.procureai.rfq.service;

import com.procureai.common.event.RfqEvent;
import com.procureai.rfq.dto.*;
import com.procureai.rfq.entity.*;
import com.procureai.rfq.exception.BusinessException;
import com.procureai.rfq.producer.RfqEventProducer;
import com.procureai.rfq.repository.RfqLineItemRepository;
import com.procureai.rfq.repository.RfqRepository;
import com.procureai.rfq.repository.RfqSupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RfqService {

    private static final AtomicLong rfqCounter = new AtomicLong(System.currentTimeMillis() % 10000);

    private final RfqRepository rfqRepository;
    private final RfqLineItemRepository lineItemRepository;
    private final RfqSupplierRepository rfqSupplierRepository;
    private final RfqEventProducer eventProducer;

    public RfqService(RfqRepository rfqRepository,
                      RfqLineItemRepository lineItemRepository,
                      RfqSupplierRepository rfqSupplierRepository,
                      RfqEventProducer eventProducer) {
        this.rfqRepository = rfqRepository;
        this.lineItemRepository = lineItemRepository;
        this.rfqSupplierRepository = rfqSupplierRepository;
        this.eventProducer = eventProducer;
    }

    @Transactional
    public RfqResponse createRfq(RfqCreateRequest request) {
        Rfq rfq = new Rfq();
        rfq.setRfqNumber(generateRfqNumber());
        rfq.setTitle(request.getTitle());
        rfq.setDescription(request.getDescription());
        rfq.setRequestedBy(request.getRequestedBy());
        rfq.setDepartment(request.getDepartment());
        rfq.setStatus(RfqStatus.DRAFT);
        rfq.setDeadline(request.getDeadline());

        List<RfqLineItem> items = new ArrayList<>();
        for (RfqLineItemRequest itemReq : request.getLineItems()) {
            RfqLineItem item = new RfqLineItem();
            item.setItemName(itemReq.getItemName());
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitOfMeasure(itemReq.getUnitOfMeasure());
            item.setCategory(itemReq.getCategory());
            item.setRfq(rfq);
            items.add(item);
        }
        rfq.setLineItems(items);

        if (request.getSupplierIds() != null && !request.getSupplierIds().isEmpty()) {
            for (Long supplierId : request.getSupplierIds()) {
                RfqSupplier rs = new RfqSupplier();
                rs.setSupplierId(supplierId);
                rs.setRfq(rfq);
                rfq.getInvitedSuppliers().add(rs);
            }
        }

        rfq = rfqRepository.save(rfq);

        RfqEvent event = new RfqEvent();
        event.setRfqId(rfq.getId());
        event.setRfqNumber(rfq.getRfqNumber());
        event.setTitle(rfq.getTitle());
        event.setDescription(rfq.getDescription());
        event.setDeadline(rfq.getDeadline());
        event.setStatus(rfq.getStatus().name());
        eventProducer.sendRfqCreated(event);

        return toRfqResponse(rfq);
    }

    @Transactional
    public RfqResponse updateRfq(Long id, RfqUpdateRequest request) {
        Rfq rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new BusinessException("RFQ not found: " + id));
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessException("Can only update RFQ in DRAFT status");
        }

        if (request.getTitle() != null) rfq.setTitle(request.getTitle());
        if (request.getDescription() != null) rfq.setDescription(request.getDescription());
        if (request.getDepartment() != null) rfq.setDepartment(request.getDepartment());
        if (request.getDeadline() != null) rfq.setDeadline(request.getDeadline());

        if (request.getLineItems() != null && !request.getLineItems().isEmpty()) {
            rfq.getLineItems().clear();
            for (RfqLineItemRequest itemReq : request.getLineItems()) {
                RfqLineItem item = new RfqLineItem();
                item.setItemName(itemReq.getItemName());
                item.setDescription(itemReq.getDescription());
                item.setQuantity(itemReq.getQuantity());
                item.setUnitOfMeasure(itemReq.getUnitOfMeasure());
                item.setCategory(itemReq.getCategory());
                item.setRfq(rfq);
                rfq.getLineItems().add(item);
            }
        }

        if (request.getSupplierIds() != null) {
            rfq.getInvitedSuppliers().clear();
            for (Long supplierId : request.getSupplierIds()) {
                RfqSupplier rs = new RfqSupplier();
                rs.setSupplierId(supplierId);
                rs.setRfq(rfq);
                rfq.getInvitedSuppliers().add(rs);
            }
        }

        rfq = rfqRepository.save(rfq);
        return toRfqResponse(rfq);
    }

    public RfqResponse getRfq(Long id) {
        Rfq rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new BusinessException("RFQ not found: " + id));
        return toRfqResponse(rfq);
    }

    public List<RfqResponse> listRfqs(String status) {
        List<Rfq> rfqs;
        if (status != null && !status.isBlank()) {
            try {
                RfqStatus rfqStatus = RfqStatus.valueOf(status.toUpperCase());
                rfqs = rfqRepository.findByStatusOrderByCreatedAtDesc(rfqStatus);
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid status: " + status);
            }
        } else {
            rfqs = rfqRepository.findAllByOrderByCreatedAtDesc();
        }
        return rfqs.stream().map(this::toRfqResponse).toList();
    }

    @Transactional
    public RfqResponse publishRfq(Long id, RfqPublishRequest request) {
        Rfq rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new BusinessException("RFQ not found: " + id));
        if (rfq.getStatus() != RfqStatus.DRAFT) {
            throw new BusinessException("Only DRAFT RFQs can be published");
        }

        rfq.getInvitedSuppliers().clear();
        for (Long supplierId : request.getSupplierIds()) {
            RfqSupplier rs = new RfqSupplier();
            rs.setSupplierId(supplierId);
            rs.setResponseStatus(SupplierResponseStatus.INVITED);
            rs.setRfq(rfq);
            rfq.getInvitedSuppliers().add(rs);
        }

        rfq.setStatus(RfqStatus.OPEN);
        rfq.setPublishedAt(LocalDate.now());
        rfq = rfqRepository.save(rfq);

        RfqEvent event = new RfqEvent();
        event.setRfqId(rfq.getId());
        event.setRfqNumber(rfq.getRfqNumber());
        event.setTitle(rfq.getTitle());
        event.setDeadline(rfq.getDeadline());
        event.setSupplierIds(request.getSupplierIds());
        event.setStatus(rfq.getStatus().name());
        eventProducer.sendRfqPublished(event);

        return toRfqResponse(rfq);
    }

    @Transactional
    public RfqResponse closeRfq(Long id) {
        Rfq rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new BusinessException("RFQ not found: " + id));
        if (rfq.getStatus() != RfqStatus.OPEN) {
            throw new BusinessException("Only OPEN RFQs can be closed");
        }
        rfq.setStatus(RfqStatus.CLOSED);
        rfq.setClosedAt(LocalDate.now());
        rfq = rfqRepository.save(rfq);
        return toRfqResponse(rfq);
    }

    @Transactional
    public RfqResponse awardRfq(Long id, RfqAwardRequest request) {
        Rfq rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new BusinessException("RFQ not found: " + id));
        if (rfq.getStatus() != RfqStatus.CLOSED && rfq.getStatus() != RfqStatus.OPEN) {
            throw new BusinessException("Can only award an OPEN or CLOSED RFQ");
        }

        boolean supplierInvited = rfq.getInvitedSuppliers().stream()
                .anyMatch(s -> s.getSupplierId().equals(request.getSupplierId()));
        if (!supplierInvited) {
            throw new BusinessException("Supplier was not invited to this RFQ");
        }

        rfq.setStatus(RfqStatus.AWARDED);
        rfq.setAwardedSupplierId(request.getSupplierId());
        rfq.setAwardedSupplierName(request.getSupplierName());
        rfq.setAwardRemarks(request.getRemarks());
        rfq.setClosedAt(LocalDate.now());
        rfq = rfqRepository.save(rfq);
        return toRfqResponse(rfq);
    }

    @Transactional
    public RfqResponse cancelRfq(Long id) {
        Rfq rfq = rfqRepository.findById(id)
                .orElseThrow(() -> new BusinessException("RFQ not found: " + id));
        if (rfq.getStatus() == RfqStatus.AWARDED || rfq.getStatus() == RfqStatus.CANCELLED) {
            throw new BusinessException("Cannot cancel an AWARDED or already CANCELLED RFQ");
        }
        rfq.setStatus(RfqStatus.CANCELLED);
        rfq = rfqRepository.save(rfq);
        return toRfqResponse(rfq);
    }

    public void addSupplierToRfq(Long rfqId, Long supplierId, String supplierName) {
        Rfq rfq = rfqRepository.findById(rfqId).orElse(null);
        if (rfq == null || rfq.getStatus() != RfqStatus.DRAFT) return;

        boolean already = rfq.getInvitedSuppliers().stream()
                .anyMatch(s -> s.getSupplierId().equals(supplierId));
        if (already) return;

        RfqSupplier rs = new RfqSupplier();
        rs.setSupplierId(supplierId);
        rs.setSupplierName(supplierName);
        rs.setRfq(rfq);
        rfq.getInvitedSuppliers().add(rs);
        rfqRepository.save(rfq);
    }

    private String generateRfqNumber() {
        return "RFQ-" + DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDateTime.now())
                + "-" + String.format("%04d", rfqCounter.incrementAndGet() % 10000);
    }

    private RfqResponse toRfqResponse(Rfq rfq) {
        RfqResponse resp = new RfqResponse();
        resp.setId(rfq.getId());
        resp.setRfqNumber(rfq.getRfqNumber());
        resp.setTitle(rfq.getTitle());
        resp.setDescription(rfq.getDescription());
        resp.setStatus(rfq.getStatus());
        resp.setRequestedBy(rfq.getRequestedBy());
        resp.setDepartment(rfq.getDepartment());
        resp.setDeadline(rfq.getDeadline());
        resp.setPublishedAt(rfq.getPublishedAt());
        resp.setClosedAt(rfq.getClosedAt());
        resp.setAwardedSupplierId(rfq.getAwardedSupplierId());
        resp.setAwardedSupplierName(rfq.getAwardedSupplierName());
        resp.setAwardRemarks(rfq.getAwardRemarks());
        resp.setCreatedAt(rfq.getCreatedAt());
        resp.setUpdatedAt(rfq.getUpdatedAt());

        if (rfq.getLineItems() != null) {
            resp.setLineItems(rfq.getLineItems().stream().map(this::toLineItemResponse).toList());
        }
        if (rfq.getInvitedSuppliers() != null) {
            resp.setInvitedSuppliers(rfq.getInvitedSuppliers().stream().map(this::toSupplierResponse).toList());
        }
        return resp;
    }

    private RfqLineItemResponse toLineItemResponse(RfqLineItem item) {
        RfqLineItemResponse r = new RfqLineItemResponse();
        r.setId(item.getId());
        r.setItemName(item.getItemName());
        r.setDescription(item.getDescription());
        r.setQuantity(item.getQuantity());
        r.setUnitOfMeasure(item.getUnitOfMeasure());
        r.setCategory(item.getCategory());
        return r;
    }

    private RfqSupplierResponse toSupplierResponse(RfqSupplier rs) {
        RfqSupplierResponse r = new RfqSupplierResponse();
        r.setId(rs.getId());
        r.setSupplierId(rs.getSupplierId());
        r.setSupplierName(rs.getSupplierName());
        r.setSupplierEmail(rs.getSupplierEmail());
        r.setResponseStatus(rs.getResponseStatus());
        r.setInvitedAt(rs.getInvitedAt());
        r.setRespondedAt(rs.getRespondedAt());
        return r;
    }
}
