const API_BASE = "http://localhost:8082/api";

export { API_BASE };

async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (res.status === 401 && token) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("user", JSON.stringify(data));
          headers["Authorization"] = `Bearer ${data.token}`;
          const retryRes = await fetch(`${API_BASE}${url}`, { ...options, headers });
          if (!retryRes.ok) {
            const err = await retryRes.json().catch(() => ({ error: "Request failed" }));
            throw new Error(err.error || `HTTP ${retryRes.status}`);
          }
          return retryRes;
        }
      } catch {
        // refresh failed, continue to error
      }
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res;
}
function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

// ========== PR / PO Types ==========

export interface PRItemRequest {
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure?: string;
}
export interface PRCreateRequest {
  title: string;
  description?: string;
  requestedBy: string;
  department?: string;
  urgency?: string;
  notes?: string;
  items: PRItemRequest[];
}
export interface ApprovalActionRequest {
  approverId: number;
  approverName?: string;
  action: "APPROVE" | "REJECT";
  comments?: string;
}

// ========== PR / PO API ==========

export async function createPR(data: PRCreateRequest) {
  const res = await authFetch("/procurement/pr", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function listPRs(status?: string) {
  const query = status ? `?status=${status}` : "";
  const res = await authFetch(`/procurement/pr${query}`);
  return res.json();
}
export async function getPR(id: number) {
  const res = await authFetch(`/procurement/pr/${id}`);
  return res.json();
}
export async function updatePR(id: number, data: Record<string, unknown>) {
  const res = await authFetch(`/procurement/pr/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function submitPR(id: number) {
  const res = await authFetch(`/procurement/pr/${id}/submit`, {
    method: "POST",
  });
  return res.json();
}
export async function approveOrRejectPR(
  id: number,
  action: ApprovalActionRequest,
) {
  const res = await authFetch(`/procurement/pr/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(action),
  });
  return res.json();
}
export async function generatePO(prId: number) {
  const res = await authFetch(`/procurement/pr/${prId}/generate-po`, {
    method: "POST",
  });
  return res.json();
}
export async function listPOs(status?: string) {
  const query = status ? `?status=${status}` : "";
  const res = await authFetch(`/procurement/po${query}`);
  return res.json();
}
export async function getPO(id: number) {
  const res = await authFetch(`/procurement/po/${id}`);
  return res.json();
}
export async function updatePOStatus(id: number, status: string) {
  const res = await authFetch(`/procurement/po/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ========== RFQ Types ==========

export interface RfqLineItemRequest {
  itemName: string;
  description?: string;
  quantity: number;
  unitOfMeasure?: string;
  category?: string;
}
export interface RfqCreateRequest {
  title: string;
  description?: string;
  requestedBy: string;
  department?: string;
  deadline: string;
  lineItems: RfqLineItemRequest[];
  supplierIds?: number[];
}
export interface RfqPublishRequest {
  supplierIds: number[];
}
export interface RfqAwardRequest {
  supplierId: number;
  supplierName: string;
  remarks?: string;
}

// ========== RFQ API ==========

export async function createRFQ(data: RfqCreateRequest) {
  const res = await authFetch("/rfq", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function listRFQs(status?: string) {
  const query = status ? `?status=${status}` : "";
  const res = await authFetch(`/rfq${query}`);
  return res.json();
}
export async function getRFQ(id: number) {
  const res = await authFetch(`/rfq/${id}`);
  return res.json();
}
export async function updateRFQ(id: number, data: Record<string, unknown>) {
  const res = await authFetch(`/rfq/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function publishRFQ(id: number, data: RfqPublishRequest) {
  const res = await authFetch(`/rfq/${id}/publish`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function closeRFQ(id: number) {
  const res = await authFetch(`/rfq/${id}/close`, { method: "POST" });
  return res.json();
}
export async function awardRFQ(id: number, data: RfqAwardRequest) {
  const res = await authFetch(`/rfq/${id}/award`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function cancelRFQ(id: number) {
  const res = await authFetch(`/rfq/${id}/cancel`, { method: "POST" });
  return res.json();
}

// ========== Quotation Types ==========

export interface QuotationLineItemRequest {
  rfqLineItemId?: number;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure?: string;
}
export interface QuotationCreateRequest {
  rfqId: number;
  rfqNumber?: string;
  rfqTitle?: string;
  supplierId: number;
  supplierName: string;
  supplierEmail?: string;
  currency?: string;
  validityStartDate?: string;
  validityEndDate?: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  notes?: string;
  lineItems: QuotationLineItemRequest[];
}
export interface QuotationEvaluateRequest {
  action: "approve" | "reject";
  score?: number;
  comments?: string;
  evaluatedBy?: string;
}

// ========== Quotation API ==========

export async function createQuotation(data: QuotationCreateRequest) {
  const res = await authFetch("/quotation", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function listQuotations(params?: {
  rfqId?: number;
  supplierId?: number;
  status?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.rfqId) qs.set("rfqId", String(params.rfqId));
  if (params?.supplierId) qs.set("supplierId", String(params.supplierId));
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString() ? `?${qs}` : "";
  const res = await authFetch(`/quotation${query}`);
  return res.json();
}
export async function getQuotation(id: number) {
  const res = await authFetch(`/quotation/${id}`);
  return res.json();
}
export async function updateQuotation(
  id: number,
  data: Record<string, unknown>,
) {
  const res = await authFetch(`/quotation/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function submitQuotation(id: number) {
  const res = await authFetch(`/quotation/${id}/submit`, { method: "POST" });
  return res.json();
}
export async function evaluateQuotation(
  id: number,
  data: QuotationEvaluateRequest,
) {
  const res = await authFetch(`/quotation/${id}/evaluate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function compareQuotations(rfqId: number) {
  const res = await authFetch(`/quotation/rfq/${rfqId}/compare`);
  return res.json();
}

// ========== Invoice Types ==========

export interface InvoiceRequest {
  invoiceNumber: string;
  poId: number;
  poNumber?: string;
  supplierId: number;
  supplierName?: string;
  totalAmount: number;
  currency?: string;
  notes?: string;
  documentUrl?: string;
}

// ========== Invoice API ==========

export async function createInvoice(data: InvoiceRequest) {
  const res = await authFetch("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function listInvoices() {
  const res = await authFetch("/invoices");
  return res.json();
}
export async function getInvoice(id: number) {
  const res = await authFetch(`/invoices/${id}`);
  return res.json();
}
export async function getInvoicesByPO(poId: number) {
  const res = await authFetch(`/invoices/po/${poId}`);
  return res.json();
}
export async function getInvoicesBySupplier(supplierId: number) {
  const res = await authFetch(`/invoices/supplier/${supplierId}`);
  return res.json();
}
export async function getInvoicesByStatus(status: string) {
  const res = await authFetch(`/invoices/status/${status}`);
  return res.json();
}
export async function approveInvoice(id: number, approvedBy: number) {
  const res = await authFetch(`/invoices/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ approvedBy }),
  });
  return res.json();
}
export async function rejectInvoice(id: number, notes?: string) {
  const res = await authFetch(`/invoices/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
  return res.json();
}

// ========== Supplier Types ==========

export interface SupplierRegisterRequest {
  companyName: string;
  registrationNumber: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  taxId?: string;
  category?: string;
  description?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactPosition?: string;
}
export interface SupplierApprovalRequest {
  approved: boolean;
  rejectionReason?: string;
}

// ========== Supplier API ==========

export async function registerSupplier(data: SupplierRegisterRequest) {
  const res = await authFetch("/suppliers/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function listSuppliers(status?: string) {
  const query = status ? `?status=${status}` : "";
  const res = await authFetch(`/suppliers${query}`);
  return res.json();
}
export async function getSupplier(id: number) {
  const res = await authFetch(`/suppliers/${id}`);
  return res.json();
}
export async function getSuppliersByCategory(category: string) {
  const res = await authFetch(
    `/suppliers/category/${encodeURIComponent(category)}`,
  );
  return res.json();
}
export async function updateSupplier(
  id: number,
  data: SupplierRegisterRequest,
) {
  const res = await authFetch(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function approveSupplier(
  id: number,
  data: SupplierApprovalRequest,
) {
  const res = await authFetch(`/suppliers/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function getSupplierStats() {
  const res = await authFetch("/suppliers/stats");
  return res.json();
}

// ========== Notification API ==========

export async function listNotifications(userId: string, status?: string) {
  const qs = new URLSearchParams({ userId });
  if (status) qs.set("status", status);
  const res = await authFetch(`/notifications?${qs}`);
  return res.json();
}
export async function getNotification(id: number) {
  const res = await authFetch(`/notifications/${id}`);
  return res.json();
}
export async function getUnreadCount(userId: string) {
  const res = await authFetch(`/notifications/unread-count?userId=${userId}`);
  return res.json();
}
export async function markNotificationRead(id: number) {
  const res = await authFetch(`/notifications/${id}/read`, { method: "PUT" });
  return res.json();
}
export async function markAllNotificationsRead(userId: string) {
  await authFetch(`/notifications/read-all?userId=${userId}`, {
    method: "PUT",
  });
}

// ========== User API ==========

export async function listUsers(role?: string) {
  const path = role ? `/users/role/${role}` : "/users";
  const res = await authFetch(path);
  return res.json();
}
export async function getUser(id: number) {
  const res = await authFetch(`/users/${id}`);
  return res.json();
}
export async function getUsersByDepartment(departmentId: number) {
  const res = await authFetch(`/users/department/${departmentId}`);
  return res.json();
}
export async function updateUser(id: number, data: Record<string, unknown>) {
  const res = await authFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

// ========== Department API ==========

export async function listDepartments() {
  const res = await authFetch("/departments");
  return res.json();
}
export async function createDepartment(data: { name: string; description?: string }) {
  const res = await authFetch("/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function updateDepartment(id: number, data: { name: string; description?: string }) {
  const res = await authFetch(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteDepartment(id: number) {
  await authFetch(`/departments/${id}`, { method: "DELETE" });
}

// ========== Approval Steps API ==========

export async function listApprovalSteps() {
  const res = await authFetch("/procurement/approval-steps");
  return res.json();
}
export async function createApprovalStep(data: Record<string, unknown>) {
  const res = await authFetch("/procurement/approval-steps", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteApprovalStep(id: number) {
  await authFetch(`/procurement/approval-steps/${id}`, { method: "DELETE" });
}

// ========== Admin Auth API ==========

export async function getPendingUsers() {
  const res = await authFetch("/auth/admin/pending-users");
  return res.json();
}

export async function getAllUsers() {
  const res = await authFetch("/auth/admin/users");
  return res.json();
}

export async function approveUser(userId: number, approved: boolean, rejectionReason?: string) {
  const res = await authFetch("/auth/admin/approve", {
    method: "POST",
    body: JSON.stringify({ userId, approved, rejectionReason }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function toggleUserStatus(userId: number, enabled: boolean) {
  const res = await authFetch("/auth/admin/toggle-status", {
    method: "POST",
    body: JSON.stringify({ userId, enabled }),
  });
  return res.json();
}

export async function adminCreateUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}) {
  const registerRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!registerRes.ok) {
    const err = await registerRes.json().catch(() => ({ error: "Registration failed" }));
    throw new Error(err.error || `HTTP ${registerRes.status}`);
  }
  const registered = await registerRes.json();
  const userId = registered.userId;
  if (userId) {
    try {
      await approveUser(userId, true);
    } catch {
      // approval is best-effort; user still created
    }
  }
  return registered;
}

export async function getCurrentUser() {
  const res = await authFetch("/auth/me");
  return res.json();
}

// ========== AI Service API ==========

export interface SupplierRankingItem {
  supplier_id: number;
  supplier_name: string;
  quotation_amount: number;
  delivery_days: number | null;
  price_score: number;
  delivery_score: number;
  reliability_score: number;
  total_score: number;
  recommendation: string;
  explanation: string;
}

export interface SupplierRankingResult {
  rfq_id: number;
  rfq_number: string | null;
  rfq_title: string | null;
  rankings: SupplierRankingItem[];
  summary: string;
}

export interface AiReasonDetail {
  aspect: string;
  detail: string;
  score: number | null;
}

export interface AiRecommendationResult {
  rfq_id: number;
  rfq_number: string | null;
  rfq_title: string | null;
  recommended_supplier_id: number | null;
  recommended_supplier_name: string | null;
  total_score: number | null;
  recommendation: string | null;
  reasons: AiReasonDetail[];
  summary: string;
}

export interface AiDashboardStats {
  total_suppliers: number;
  total_purchase_orders: number;
  total_quotations: number;
  total_rfqs: number;
  total_spend: number;
  average_quote_value: number;
  top_suppliers: {
    supplier_id: number;
    company_name: string;
    score: number;
    total_orders: number;
  }[];
}

export async function getAiDashboard(): Promise<AiDashboardStats> {
  const res = await authFetch("/ai/dashboard");
  return res.json();
}

export async function getSupplierRanking(
  rfqId: number,
): Promise<SupplierRankingResult> {
  const res = await authFetch(`/ai/supplier-ranking/${rfqId}`);
  return res.json();
}

export async function getAiRecommendation(
  rfqId: number,
): Promise<AiRecommendationResult> {
  const res = await authFetch(`/ai/recommend/${rfqId}`);
  return res.json();
}
