package com.glumbi.service;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAlertService {

    private final UserRepository userRepo;
    private final NotificationService notificationService;
    private final ResendClient resendClient;
    private final EmailTemplates emailTemplates;

    public void notifyUserRegistered(AppUser newUser, String provider) {
        String masked = maskEmail(newUser.getEmail());
        String displayName = newUser.getDisplayName();
        String nameClause = (displayName != null && !displayName.isBlank()) ? " (" + displayName + ")" : "";
        String message = "👋 New user registered via " + provider + ": " + masked + nameClause;
        String subject = "👋 New Glumbi user registered";
        String bodyHtml = "<p>A new user has joined Glumbi.</p>"
                + "<ul><li><strong>Email:</strong> " + masked + "</li>"
                + (nameClause.isBlank() ? "" : "<li><strong>Name:</strong> " + displayName + "</li>")
                + "<li><strong>Registered via:</strong> " + provider + "</li></ul>";
        alertSuperAdmins(subject, message, bodyHtml);
    }

    public void notifyUserDeleted(String deletedEmail, String deletedBy) {
        String masked = maskEmail(deletedEmail);
        String maskedBy = deletedBy.startsWith("admin: ") ? "admin: " + maskEmail(deletedBy.substring(7)) : deletedBy;
        String message = "🗑️ User account deleted: " + masked + " (by " + maskedBy + ")";
        String subject = "🗑️ Glumbi account deleted";
        String bodyHtml = "<p>A user account has been deleted.</p>"
                + "<ul><li><strong>Email:</strong> " + masked + "</li>"
                + "<li><strong>Deleted by:</strong> " + maskedBy + "</li></ul>";
        alertSuperAdmins(subject, message, bodyHtml);
    }

    public void notifyStatsAlert(String message, String level) {
        List<AppUser> superAdmins = userRepo.findByRole(AppUser.Role.SUPER_ADMIN);
        for (AppUser sa : superAdmins) {
            try {
                notificationService.save(sa, null, NotificationType.ADMIN_ALERT, message);
            } catch (Exception e) {
                log.warn("Failed to save stats alert for {}: {}", sa.getEmail(), e.getMessage());
            }
        }
    }

    private void alertSuperAdmins(String emailSubject, String inAppMessage, String bodyHtml) {
        List<AppUser> superAdmins = userRepo.findByRole(AppUser.Role.SUPER_ADMIN);
        for (AppUser sa : superAdmins) {
            try {
                notificationService.save(sa, null, NotificationType.ADMIN_ALERT, inAppMessage);
                resendClient.send(sa.getEmail(), emailSubject, emailTemplates.adminAlert(emailSubject, bodyHtml));
            } catch (Exception e) {
                log.warn("Failed to alert super admin {}: {}", sa.getEmail(), e.getMessage());
            }
        }
    }

    private String maskEmail(String email) {
        return com.glumbi.util.MaskUtil.maskEmail(email);
    }
}
