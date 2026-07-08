package com.procureai.common.event;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

public abstract class BaseEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private String eventId;
    private String eventType;
    private LocalDateTime timestamp;
    private String source;
    private Long companyId;

    public BaseEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
    }

    public BaseEvent(String eventType, String source) {
        this();
        this.eventType = eventType;
        this.source = source;
    }

    public BaseEvent(String eventType, String source, Long companyId) {
        this();
        this.eventType = eventType;
        this.source = source;
        this.companyId = companyId;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
}
