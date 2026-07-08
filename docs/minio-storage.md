# MinIO File Storage

ProcureAI stores uploaded files in MinIO using a tenant-isolated key structure:

`{companyId}/{document-type}/{year}/{month}/{uuid}.{ext}`

Examples:

- `42/rfq-attachments/2026/07/f3a1b2c4.pdf`
- `42/proforma-invoices/2026/07/ab12cd34.pdf`

Default bucket:

- `procureai-files`

Shared Java helper:

```java
String bucket = MinioObjectKeyBuilder.getBucketName();
String objectKey = MinioObjectKeyBuilder.buildKey(companyId, "rfq-attachments", originalFilename);
```

The helper lives in `services/common/src/main/java/com/procureai/common/storage/MinioObjectKeyBuilder.java` and normalizes the document type before building the key.