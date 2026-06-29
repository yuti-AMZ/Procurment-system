package com.procureai.notification.service;

import com.procureai.notification.dto.NotificationResponse;
import com.procureai.notification.dto.PreferenceUpdateRequest;
import com.procureai.notification.entity.Notification;
import com.procureai.notification.entity.NotificationPreference;
import com.procureai.notification.entity.NotificationStatus;
import com.procureai.notification.exception.BusinessException;
import com.procureai.notification.repository.NotificationPreferenceRepository;
import com.procureai.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceRepository preferenceRepository,
                               JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.mailSender = mailSender;
    }

    @Transactional
    public NotificationResponse createNotification(String recipientUserId, String recipientEmail,
                                                    String title, String message,
                                                    String notificationType, String link,
                                                    String sourceService) {
        Notification n = new Notification();
        n.setRecipientUserId(recipientUserId);
        n.setRecipientEmail(recipientEmail);
        n.setTitle(title);
        n.setMessage(message);
        n.setNotificationType(notificationType);
        n.setLink(link);
        n.setSourceService(sourceService);
        n.setStatus(NotificationStatus.UNREAD);
        n = notificationRepository.save(n);

        boolean emailEnabled = true;
        if (recipientUserId != null) {
            var pref = preferenceRepository.findByUserId(recipientUserId);
            emailEnabled = pref.map(NotificationPreference::isEmailEnabled).orElse(true);
        }
        if (emailEnabled && recipientEmail != null) {
            sendEmail(recipientEmail, title, message);
        }

        return toResponse(n);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Notification not found: " + id));
        n.setStatus(NotificationStatus.READ);
        n.setReadAt(LocalDateTime.now());
        n = notificationRepository.save(n);
        return toResponse(n);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientUserIdAndStatusOrderByCreatedAtDesc(userId, NotificationStatus.UNREAD);
        for (Notification n : unread) {
            n.setStatus(NotificationStatus.READ);
            n.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(unread);
    }

    public List<NotificationResponse> listNotifications(String userId, String status) {
        if (status != null && !status.isBlank()) {
            try {
                NotificationStatus ns = NotificationStatus.valueOf(status.toUpperCase());
                return notificationRepository
                        .findByRecipientUserIdAndStatusOrderByCreatedAtDesc(userId, ns)
                        .stream().map(this::toResponse).toList();
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Invalid status: " + status);
            }
        }
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    public NotificationResponse getNotification(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Notification not found: " + id));
        return toResponse(n);
    }

    public NotificationPreference getPreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference p = new NotificationPreference();
                    p.setUserId(userId);
                    p.setEmailEnabled(true);
                    p.setInAppEnabled(true);
                    return preferenceRepository.save(p);
                });
    }

    @Transactional
    public NotificationPreference updatePreferences(String userId, PreferenceUpdateRequest request) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference p = new NotificationPreference();
                    p.setUserId(userId);
                    return p;
                });
        pref.setEmailEnabled(request.isEmailEnabled());
        pref.setInAppEnabled(request.isInAppEnabled());
        return preferenceRepository.save(pref);
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setRecipientUserId(n.getRecipientUserId());
        r.setRecipientEmail(n.getRecipientEmail());
        r.setTitle(n.getTitle());
        r.setMessage(n.getMessage());
        r.setNotificationType(n.getNotificationType());
        r.setLink(n.getLink());
        r.setSourceService(n.getSourceService());
        r.setStatus(n.getStatus());
        r.setCreatedAt(n.getCreatedAt());
        r.setReadAt(n.getReadAt());
        return r;
    }
}
