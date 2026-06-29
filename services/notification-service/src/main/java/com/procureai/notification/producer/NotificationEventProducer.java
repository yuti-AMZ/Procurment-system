package com.procureai.notification.producer;

import com.procureai.common.event.NotificationEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public NotificationEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendNotification(NotificationEvent event) {
        event.setEventType("NOTIFICATION");
        event.setSource("notification-service");
        rabbitTemplate.convertAndSend("notification.exchange", "notification.send", event);
    }
}
