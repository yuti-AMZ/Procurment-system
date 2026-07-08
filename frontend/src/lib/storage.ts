export const MINIO_BUCKET_NAME = "procureai-files";

function normalizeDocumentType(documentType: string) {
  return (documentType || "documents")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === fileName.length - 1) {
    return "";
  }
  return fileName.slice(lastDot + 1).toLowerCase();
}

function getBaseName(fileName: string) {
  return fileName.split(/[\\/]/).pop() || fileName;
}

export function buildMinioObjectKey(
  companyId: number | string,
  documentType: string,
  originalFileName: string,
) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const baseName = getBaseName(originalFileName);
  const extension = getFileExtension(baseName);
  const uuid = crypto.randomUUID().slice(0, 8);
  const fileName = extension ? `${uuid}.${extension}` : uuid;

  return `${companyId}/${normalizeDocumentType(documentType)}/${year}/${month}/${fileName}`;
}