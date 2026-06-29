package com.procureai.common.config;

public final class RabbitMQConstants {

    private RabbitMQConstants() {}

    // --- Exchanges ---
    public static final String EXCHANGE_PROCUREMENT = "procurement.exchange";
    public static final String EXCHANGE_RFQ = "rfq.exchange";
    public static final String EXCHANGE_SUPPLIER = "supplier.exchange";
    public static final String EXCHANGE_QUOTATION = "quotation.exchange";
    public static final String EXCHANGE_INVOICE = "invoice.exchange";
    public static final String EXCHANGE_NOTIFICATION = "notification.exchange";

    // --- Queues ---
    public static final String QUEUE_PR_CREATED = "pr.created.queue";
    public static final String QUEUE_PR_APPROVED = "pr.approved.queue";
    public static final String QUEUE_PO_GENERATED = "po.generated.queue";
    public static final String QUEUE_RFQ_CREATED = "rfq.created.queue";
    public static final String QUEUE_RFQ_PUBLISHED = "rfq.published.queue";
    public static final String QUEUE_QUOTATION_SUBMITTED = "quotation.submitted.queue";
    public static final String QUEUE_SUPPLIER_REGISTERED = "supplier.registered.queue";
    public static final String QUEUE_SUPPLIER_APPROVED = "supplier.approved.queue";
    public static final String QUEUE_SUPPLIER_REJECTED = "supplier.rejected.queue";
    public static final String QUEUE_INVOICE_UPLOADED = "invoice.uploaded.queue";
    public static final String QUEUE_NOTIFICATION = "notification.queue";

    // --- Routing Keys ---
    public static final String RK_PROCUREMENT_PR_CREATED = "procurement.pr.created";
    public static final String RK_PROCUREMENT_PR_APPROVED = "procurement.pr.approved";
    public static final String RK_PROCUREMENT_PO_GENERATED = "procurement.po.generated";
    public static final String RK_RFQ_CREATED = "rfq.created";
    public static final String RK_RFQ_PUBLISHED = "rfq.published";
    public static final String RK_QUOTATION_SUBMITTED = "quotation.submitted";
    public static final String RK_SUPPLIER_REGISTERED = "supplier.registered";
    public static final String RK_SUPPLIER_APPROVED = "supplier.approved";
    public static final String RK_SUPPLIER_REJECTED = "supplier.rejected";
    public static final String RK_INVOICE_UPLOADED = "invoice.uploaded";
    public static final String RK_NOTIFICATION_ALL = "#";
}
