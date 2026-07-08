package com.procureai.notification.consumer;

import com.procureai.common.event.CompanyEvent;
import com.procureai.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class CompanyEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(CompanyEventConsumer.class);
    private final NotificationService notificationService;

    public CompanyEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.auth.queue")
    public void handleCompanyEvent(CompanyEvent event) {
        log.info("Company event received: type={}, company={}", event.getEventType(), event.getCompanyName());

        switch (event.getEventType()) {
            case "COMPANY_APPROVED" -> handleCompanyApproved(event);
            case "COMPANY_REJECTED" -> handleCompanyRejected(event);
            default -> log.info("Unhandled company event type: {}", event.getEventType());
        }
    }

    private void handleCompanyApproved(CompanyEvent event) {
        String recipientEmail = event.getAdminEmail() != null ? event.getAdminEmail() : event.getCompanyEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("No email found for approved company: {}", event.getCompanyName());
            return;
        }

        String firstName = event.getAdminFirstName() != null ? event.getAdminFirstName() : "there";

        String htmlBody = """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #c9a84c; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">Welcome to ProcureAI</h1>
                    </div>
                    <div style="padding: 30px; border: 1px solid #e8d48b; border-top: none; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #333;">Hello %s,</h2>
                        <p style="color: #555; line-height: 1.6;">
                            Great news! Your organization <strong>%s</strong> has been approved and is now active on ProcureAI.
                        </p>
                        <p style="color: #555; line-height: 1.6;">
                            You can now log in and start using all the features available to your organization, including:
                        </p>
                        <ul style="color: #555; line-height: 1.8;">
                            <li>Purchase request management</li>
                            <li>Approval workflows</li>
                            <li>Supplier management</li>
                            <li>Reporting and analytics</li>
                        </ul>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/login"
                               style="background-color: #c9a84c; color: white; padding: 12px 30px;
                                      text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Log In to ProcureAI
                            </a>
                        </div>
                        <p style="color: #777; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
                            If you have any questions, please contact our support team.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(firstName, event.getCompanyName());

        notificationService.createNotification(
                event.getCompanyId(),
                null,
                recipientEmail,
                "Welcome to ProcureAI - Your Organization is Active!",
                htmlBody,
                "COMPANY_APPROVED",
                "/dashboard",
                "auth-service"
        );

        log.info("Welcome email sent to {} for company {}", recipientEmail, event.getCompanyName());
    }

    private void handleCompanyRejected(CompanyEvent event) {
        String recipientEmail = event.getAdminEmail() != null ? event.getAdminEmail() : event.getCompanyEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("No email found for rejected company: {}", event.getCompanyName());
            return;
        }

        String firstName = event.getAdminFirstName() != null ? event.getAdminFirstName() : "there";
        String reason = event.getRejectionReason() != null ? event.getRejectionReason() : "No reason provided.";

        String htmlBody = """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #c94c4c; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">ProcureAI Registration Update</h1>
                    </div>
                    <div style="padding: 30px; border: 1px solid #e8d48b; border-top: none; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #333;">Hello %s,</h2>
                        <p style="color: #555; line-height: 1.6;">
                            We regret to inform you that your organization <strong>%s</strong> was not approved at this time.
                        </p>
                        <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong style="color: #333;">Reason:</strong>
                            <p style="color: #555; margin: 5px 0 0 0;">%s</p>
                        </div>
                        <p style="color: #555; line-height: 1.6;">
                            If you believe this was an error or have questions, please contact our support team.
                        </p>
                        <p style="color: #777; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px;">
                            ProcureAI Support Team
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(firstName, event.getCompanyName(), reason);

        notificationService.createNotification(
                event.getCompanyId(),
                null,
                recipientEmail,
                "ProcureAI - Registration Update",
                htmlBody,
                "COMPANY_REJECTED",
                null,
                "auth-service"
        );

        log.info("Rejection email sent to {} for company {}", recipientEmail, event.getCompanyName());
    }
}
