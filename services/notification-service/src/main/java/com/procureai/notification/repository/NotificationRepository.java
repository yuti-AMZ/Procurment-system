package com.procureai.notification.repository;

import com.procureai.notification.entity.Notification;
import com.procureai.notification.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);
    List<Notification> findByRecipientUserIdAndStatusOrderByCreatedAtDesc(
            String recipientUserId, NotificationStatus status);
    long countByRecipientUserIdAndStatus(String recipientUserId, NotificationStatus status);
}
