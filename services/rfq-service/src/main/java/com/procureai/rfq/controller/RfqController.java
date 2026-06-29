package com.procureai.rfq.controller;

import com.procureai.rfq.dto.*;
import com.procureai.rfq.service.RfqService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rfq")
public class RfqController {

    private final RfqService rfqService;

    public RfqController(RfqService rfqService) {
        this.rfqService = rfqService;
    }

    @PostMapping
    public ResponseEntity<RfqResponse> createRfq(@Valid @RequestBody RfqCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rfqService.createRfq(request));
    }

    @GetMapping
    public ResponseEntity<List<RfqResponse>> listRfqs(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(rfqService.listRfqs(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RfqResponse> getRfq(@PathVariable Long id) {
        return ResponseEntity.ok(rfqService.getRfq(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RfqResponse> updateRfq(@PathVariable Long id,
                                                  @Valid @RequestBody RfqUpdateRequest request) {
        return ResponseEntity.ok(rfqService.updateRfq(id, request));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<RfqResponse> publishRfq(@PathVariable Long id,
                                                   @Valid @RequestBody RfqPublishRequest request) {
        return ResponseEntity.ok(rfqService.publishRfq(id, request));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<RfqResponse> closeRfq(@PathVariable Long id) {
        return ResponseEntity.ok(rfqService.closeRfq(id));
    }

    @PostMapping("/{id}/award")
    public ResponseEntity<RfqResponse> awardRfq(@PathVariable Long id,
                                                 @Valid @RequestBody RfqAwardRequest request) {
        return ResponseEntity.ok(rfqService.awardRfq(id, request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<RfqResponse> cancelRfq(@PathVariable Long id) {
        return ResponseEntity.ok(rfqService.cancelRfq(id));
    }
}
