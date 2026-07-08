package com.procureai.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
public class FeatureNotAvailableException extends RuntimeException {

    public FeatureNotAvailableException(String feature) {
        super("Feature '" + feature + "' is not available on your current plan. Upgrade to access this.");
    }

    public FeatureNotAvailableException(String feature, String message) {
        super(message);
    }
}
