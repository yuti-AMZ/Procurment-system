package com.procureai.common.event;

import java.util.Map;

public class NotificationEvent extends BaseEvent {
    private String recipientEmail;
    private String recipientUserId;
    private String title;
    private String message;
    private String notificationType;
    private Map<String, Object> metadata;

    public NotificationEvent() {}

    public NotificationEvent(String eventType, String source) {
        super(eventType, source);
    }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(String recipientUserId) { this.recipientUserId = recipientUserId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
