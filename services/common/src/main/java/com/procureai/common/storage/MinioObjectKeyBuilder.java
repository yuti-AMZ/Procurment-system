package com.procureai.common.storage;

import java.nio.file.Path;
import java.time.YearMonth;
import java.util.Locale;
import java.util.UUID;

public final class MinioObjectKeyBuilder {

    public static final String DEFAULT_BUCKET = "procureai-files";

    private MinioObjectKeyBuilder() {
    }

    public static String buildKey(long companyId, String documentType, String originalFilename) {
        YearMonth now = YearMonth.now();
        String extension = getExtension(originalFilename);
        String fileName = UUID.randomUUID().toString().substring(0, 8);

        if (!extension.isEmpty()) {
            fileName = fileName + "." + extension;
        }

        return String.format(
                Locale.ROOT,
                "%d/%s/%d/%02d/%s",
                companyId,
                normalizePathSegment(documentType),
                now.getYear(),
                now.getMonthValue(),
                fileName);
    }

    public static String getBucketName() {
        return DEFAULT_BUCKET;
    }

    private static String getExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        String name = Path.of(filename).getFileName().toString();
        int lastDot = name.lastIndexOf('.');
        if (lastDot < 0 || lastDot == name.length() - 1) {
            return "";
        }
        return name.substring(lastDot + 1).toLowerCase(Locale.ROOT);
    }

    private static String normalizePathSegment(String value) {
        if (value == null || value.isBlank()) {
            return "documents";
        }
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-");
    }
}