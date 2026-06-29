package com.procureai.supplier.exception;

public class DuplicateSupplierException extends RuntimeException {
    public DuplicateSupplierException(String field, String value) {
        super("Supplier with " + field + " '" + value + "' already exists");
    }
}
