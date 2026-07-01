package com.glumbi.repository;

import com.glumbi.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<Activity> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    List<Activity> findByChildIdAndCompletedTrueOrderByCreatedAtDesc(Long childId);
    void deleteByChildId(Long childId);
    void deleteByChildIdAndCompletedFalse(Long childId);
    long countByCreatedAtAfter(LocalDateTime since);
}
