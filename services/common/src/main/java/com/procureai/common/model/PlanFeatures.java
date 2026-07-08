package com.procureai.common.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

public class PlanFeatures {

    private Map<String, Boolean> features = new HashMap<>();

    public PlanFeatures() {}

    public PlanFeatures(Map<String, Boolean> features) {
        this.features = features != null ? features : new HashMap<>();
    }

    @JsonIgnore
    public boolean isEnabled(String featureKey) {
        return features.getOrDefault(featureKey.toUpperCase(), false);
    }

    public void enable(String featureKey) {
        features.put(featureKey.toUpperCase(), true);
    }

    public Map<String, Boolean> getFeatures() { return features; }
    public void setFeatures(Map<String, Boolean> features) { this.features = features; }

    public String toJson() {
        try {
            return new ObjectMapper().writeValueAsString(this);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize PlanFeatures", e);
        }
    }

    public static PlanFeatures fromJson(String json) {
        try {
            return new ObjectMapper().readValue(json, PlanFeatures.class);
        } catch (JsonProcessingException e) {
            return new PlanFeatures();
        }
    }

    public static PlanFeatures empty() {
        return new PlanFeatures();
    }
}
