package com.glumbi.service;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.entity.Notification;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    @Value("${app.quota.notification-history-days:30}")
    private int historyDays;

    private final NotificationRepository repo;

    public void save(AppUser user, Child child, NotificationType type, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setChild(child);
        n.setType(type);
        n.setMessage(message);
        repo.save(n);
    }

    public List<Notification> getAll(AppUser user) {
        return repo.findByUserAndCreatedAtAfterOrderByCreatedAtDesc(
            user, LocalDateTime.now().minusDays(historyDays)
        );
    }

    public long getUnreadCount(AppUser user) {
        return repo.countByUserAndReadFalse(user);
    }

    @Transactional
    public void markAllRead(AppUser user) {
        repo.markAllReadByUser(user);
    }
}
