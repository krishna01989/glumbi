package com.glumbi.repository;

import com.glumbi.entity.WritingEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WritingRepository extends JpaRepository<WritingEntry, Long> {
    List<WritingEntry> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<WritingEntry> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    long countByCreatedAtAfter(LocalDateTime since);
    long countByChildIdAndFeedbackReceivedTrueAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    List<WritingEntry> findTop5ByOrderByCreatedAtDesc();
}
