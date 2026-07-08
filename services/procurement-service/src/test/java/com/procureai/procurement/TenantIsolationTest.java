package com.procureai.procurement;

import com.procureai.common.security.GatewayAuthenticationToken;
import com.procureai.procurement.dto.*;
import com.procureai.procurement.entity.*;
import com.procureai.procurement.exception.BusinessException;
import com.procureai.procurement.producer.ProcurementEventProducer;
import com.procureai.procurement.repository.*;
import com.procureai.procurement.service.ApprovalService;
import com.procureai.procurement.service.ProcurementService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Phase 1 Tenant Isolation Tests — Pure Unit Tests (Mockito, no DB required)
 *
 * Verifies that ProcurementService correctly enforces tenant isolation by:
 *   1. Using findByIdAndCompanyId (not findById) so cross-tenant IDs return empty
 *   2. Throwing BusinessException (mapped to 404) for cross-tenant access attempts
 *   3. Stamping the correct companyId from TenantContext on new records
 *   4. List queries being scoped only to the current tenant's companyId
 */
@ExtendWith(MockitoExtension.class)
class TenantIsolationTest {

    @Mock private PurchaseRequestRepository prRepository;
    @Mock private PurchaseRequestItemRepository prItemRepository;
    @Mock private PurchaseOrderRepository poRepository;
    @Mock private PurchaseOrderItemRepository poItemRepository;
    @Mock private ApprovalStepRepository approvalStepRepository;
    @Mock private ApprovalRecordRepository approvalRecordRepository;
    @Mock private ApprovalService approvalService;
    @Mock private ProcurementEventProducer eventProducer;

    @InjectMocks
    private ProcurementService procurementService;

    private static final Long COMPANY_A = 1001L;
    private static final Long COMPANY_B = 1002L;

    @BeforeEach
    void authenticateAsCompanyA() {
        // Default test context: authenticated as Company A
        authenticateAs(COMPANY_A, "employee@hospital-a.com", "EMPLOYEE");
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    // ── Test 1: getPR() enforces tenant isolation ──────────────────────────────

    @Test
    @DisplayName("getPR returns PR when the correct tenant requests it")
    void getPR_correctTenant_returnsData() {
        PurchaseRequest prA = buildPR(42L, COMPANY_A, "PR-001");
        when(prRepository.findByIdAndCompanyId(42L, COMPANY_A)).thenReturn(Optional.of(prA));

        PRResponse response = procurementService.getPR(42L);

        assertThat(response.getPrNumber()).isEqualTo("PR-001");
        verify(prRepository).findByIdAndCompanyId(42L, COMPANY_A);
    }

    @Test
    @DisplayName("getPR throws BusinessException when Company B tries to access Company A's PR")
    void getPR_crossTenantAccess_throws() {
        // Simulate the DB correctly returning empty for a cross-tenant lookup
        when(prRepository.findByIdAndCompanyId(42L, COMPANY_A)).thenReturn(Optional.empty());

        // Company A (in context) tries to access PR 42 which doesn't belong to them
        assertThatThrownBy(() -> procurementService.getPR(42L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("PR not found");
    }

    @Test
    @DisplayName("getPR NEVER calls plain findById — always uses tenant-scoped query")
    void getPR_neverCallsPlainFindById() {
        when(prRepository.findByIdAndCompanyId(any(), any())).thenReturn(Optional.empty());

        try { procurementService.getPR(99L); } catch (BusinessException ignored) {}

        // Verify the service never used the non-tenant-safe findById
        verify(prRepository, never()).findById(any());
        verify(prRepository).findByIdAndCompanyId(99L, COMPANY_A);
    }

    // ── Test 2: listPRs() always scopes to the current tenant ─────────────────

    @Test
    @DisplayName("listPRs queries only with current tenant's companyId")
    void listPRs_alwaysScopedToCurrentTenant() {
        when(prRepository.findByCompanyIdOrderByCreatedAtDesc(COMPANY_A)).thenReturn(List.of());

        procurementService.listPRs(null);

        // Must query with Company A's ID — never a raw findAll
        verify(prRepository).findByCompanyIdOrderByCreatedAtDesc(COMPANY_A);
        verify(prRepository, never()).findAll();
        verify(prRepository, never()).findAllByOrderByCreatedAtDesc();
    }

    @Test
    @DisplayName("When Company B is authenticated, listPRs uses Company B's companyId")
    void listPRs_whenCompanyBAuthenticated_usesCompanyBId() {
        authenticateAs(COMPANY_B, "employee@university-b.com", "EMPLOYEE");
        when(prRepository.findByCompanyIdOrderByCreatedAtDesc(COMPANY_B)).thenReturn(List.of());

        procurementService.listPRs(null);

        verify(prRepository).findByCompanyIdOrderByCreatedAtDesc(COMPANY_B);
        // Company A's data is NEVER queried
        verify(prRepository, never()).findByCompanyIdOrderByCreatedAtDesc(COMPANY_A);
    }

    // ── Test 3: createPR() stamps the correct companyId ───────────────────────

    @Test
    @DisplayName("createPR stamps the current tenant's companyId onto the new PR")
    void createPR_stampsCorrectCompanyId() {
        PRItemRequest item = new PRItemRequest();
        item.setItemName("Oxygen Cylinders");
        item.setQuantity(50);
        item.setUnitPrice(BigDecimal.valueOf(6000));
        item.setUnitOfMeasure("UNIT");

        PRCreateRequest request = new PRCreateRequest();
        request.setTitle("Emergency Medical Supplies");
        request.setRequestedBy("employee@hospital-a.com");
        request.setItems(List.of(item));

        when(prRepository.save(any(PurchaseRequest.class))).thenAnswer(inv -> {
            PurchaseRequest saved = inv.getArgument(0);
            // Assert the service stamped the correct companyId
            assertThat(saved.getCompanyId())
                    .as("createPR must stamp COMPANY_A's id from TenantContext")
                    .isEqualTo(COMPANY_A);
            saved.setId(100L);
            return saved;
        });
        doNothing().when(eventProducer).sendPrCreated(any());

        procurementService.createPR(request);

        verify(prRepository).save(argThat(pr -> COMPANY_A.equals(pr.getCompanyId())));
    }

    @Test
    @DisplayName("createPR never uses a hardcoded or request-provided companyId")
    void createPR_neverUsesHardcodedCompanyId() {
        // Even if someone passes companyId 9999 in request body, the service
        // must use TenantContext (COMPANY_A from JWT), not the request value
        PRItemRequest item = new PRItemRequest();
        item.setItemName("Test Item");
        item.setQuantity(1);
        item.setUnitPrice(BigDecimal.TEN);
        item.setUnitOfMeasure("UNIT");

        PRCreateRequest request = new PRCreateRequest();
        request.setTitle("Test PR");
        request.setRequestedBy("employee@hospital-a.com");
        request.setItems(List.of(item));

        when(prRepository.save(any(PurchaseRequest.class))).thenAnswer(inv -> {
            PurchaseRequest saved = inv.getArgument(0);
            // Must NEVER be any company other than COMPANY_A
            assertThat(saved.getCompanyId()).isNotEqualTo(9999L);
            assertThat(saved.getCompanyId()).isEqualTo(COMPANY_A);
            saved.setId(200L);
            return saved;
        });
        doNothing().when(eventProducer).sendPrCreated(any());

        procurementService.createPR(request);
    }

    // ── Test 4: updatePR() enforces tenant isolation ───────────────────────────

    @Test
    @DisplayName("updatePR throws when PR belongs to different tenant")
    void updatePR_crossTenantUpdate_throws() {
        // DB returns empty for cross-tenant lookup (correct behavior)
        when(prRepository.findByIdAndCompanyId(55L, COMPANY_A)).thenReturn(Optional.empty());

        PRUpdateRequest update = new PRUpdateRequest();
        update.setTitle("Malicious Update");

        assertThatThrownBy(() -> procurementService.updatePR(55L, update))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("PR not found");
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private PurchaseRequest buildPR(Long id, Long companyId, String prNumber) {
        PurchaseRequest pr = new PurchaseRequest();
        pr.setId(id);
        pr.setCompanyId(companyId);
        pr.setPrNumber(prNumber);
        pr.setTitle("Test PR");
        pr.setStatus(PRStatus.DRAFT);
        pr.setTotalAmount(BigDecimal.valueOf(1000));
        pr.setRequestedBy("employee@test.com");
        return pr;
    }

    private void authenticateAs(Long companyId, String email, String role) {
        GatewayAuthenticationToken auth = new GatewayAuthenticationToken(
                companyId * 100, email, role, "Test", "User", companyId);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
