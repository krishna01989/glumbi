package com.glumbi.service;

import com.glumbi.entity.AppUser;
import com.glumbi.entity.Child;
import com.glumbi.entity.Notification;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

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
        return repo.findByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadCount(AppUser user) {
        return repo.countByUserAndReadFalse(user);
    }

    @Transactional
    public void markAllRead(AppUser user) {
        repo.markAllReadByUser(user);
    }
}
