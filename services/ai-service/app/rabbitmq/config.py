from pydantic_settings import BaseSettings


class RabbitMQSettings(BaseSettings):
    host: str = "localhost"
    port: int = 5672
    username: str = "guest"
    password: str = "guest"

    # Exchange names
    procurement_exchange: str = "procurement.exchange"
    rfq_exchange: str = "rfq.exchange"
    supplier_exchange: str = "supplier.exchange"
    quotation_exchange: str = "quotation.exchange"
    invoice_exchange: str = "invoice.exchange"
    notification_exchange: str = "notification.exchange"

    # Queue names
    pr_created_queue: str = "pr.created.queue"
    pr_approved_queue: str = "pr.approved.queue"
    po_generated_queue: str = "po.generated.queue"
    rfq_created_queue: str = "rfq.created.queue"
    rfq_published_queue: str = "rfq.published.queue"
    rfq_closed_queue: str = "rfq.closed.queue"
    quotation_submitted_queue: str = "quotation.submitted.queue"
    supplier_approved_queue: str = "supplier.approved.queue"
    supplier_updated_queue: str = "supplier.updated.queue"
    invoice_uploaded_queue: str = "invoice.uploaded.queue"
    notification_queue: str = "notification.queue"

    # Routing keys
    rk_pr_created: str = "procurement.pr.created"
    rk_pr_approved: str = "procurement.pr.approved"
    rk_po_generated: str = "procurement.po.generated"
    rk_rfq_created: str = "rfq.created"
    rk_rfq_published: str = "rfq.published"
    rk_rfq_closed: str = "rfq.closed"
    rk_quotation_submitted: str = "quotation.submitted"
    rk_supplier_approved: str = "supplier.approved"
    rk_supplier_updated: str = "supplier.updated"
    rk_invoice_uploaded: str = "invoice.uploaded"

    model_config = {"env_prefix": "RABBITMQ_"}


settings = RabbitMQSettings()
