package com.procureai.quotation.dto;

import jakarta.validation.constraints.NotBlank;

public class QuotationEvaluateRequest {

    @NotBlank
    private String action;

    private Integer score;
    private String comments;
    private String evaluatedBy;

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public String getEvaluatedBy() { return evaluatedBy; }
    public void setEvaluatedBy(String evaluatedBy) { this.evaluatedBy = evaluatedBy; }
}
