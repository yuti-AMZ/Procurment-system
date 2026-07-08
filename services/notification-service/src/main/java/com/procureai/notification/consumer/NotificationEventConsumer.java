package com.procureai.notification.consumer;

import com.procureai.common.event.NotificationEvent;
import com.procureai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);
    private final NotificationService notificationService;

    public NotificationEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.queue")
    public void handleNotification(NotificationEvent event) {
        log.info("Notification event: type={}, title={}, recipient={}",
                event.getNotificationType(), event.getTitle(), event.getRecipientEmail());

        notificationService.createNotification(
                event.getCompanyId(),
                event.getRecipientUserId(),
                event.getRecipientEmail(),
                event.getTitle(),
                event.getMessage(),
                event.getNotificationType(),
                null,
                event.getSource()
        );
    }
}
