package com.glumbi.repository;

import com.glumbi.entity.Notification;
import com.glumbi.entity.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserAndCreatedAtAfter(AppUser user, LocalDateTime since, Pageable pageable);

    long countByUserAndReadFalse(AppUser user);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user AND n.read = false")
    void markAllReadByUser(AppUser user);

    void deleteByChildId(Long childId);
}
