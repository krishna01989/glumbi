package com.glumbi.repository;

import com.glumbi.entity.Notification;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.entity.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserAndCreatedAtAfter(AppUser user, LocalDateTime since, Pageable pageable);

    long countByUserAndReadFalse(AppUser user);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user AND n.read = false")
    void markAllReadByUser(AppUser user);

    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(AppUser user, NotificationType type);

    long countByUserAndTypeAndReadFalse(AppUser user, NotificationType type);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user AND n.type = :type AND n.read = false")
    void markAllReadByUserAndType(AppUser user, NotificationType type);

    void deleteByChildId(Long childId);

    void deleteByUserId(Long userId);
}
