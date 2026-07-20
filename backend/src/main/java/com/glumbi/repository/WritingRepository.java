package com.glumbi.repository;

import com.glumbi.entity.WritingEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WritingRepository extends JpaRepository<WritingEntry, Long> {
    List<WritingEntry> findByChildIdOrderByCreatedAtDesc(Long childId);
    Page<WritingEntry> findByChildIdOrderByCreatedAtDesc(Long childId, Pageable pageable);
    Page<WritingEntry> findByChildIdAndSeriesIdIsNullOrderByCreatedAtDesc(Long childId, Pageable pageable);
    List<WritingEntry> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    long countByCreatedAtAfter(LocalDateTime since);
    long countByChildIdAndFeedbackReceivedTrueAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    List<WritingEntry> findTop5ByOrderByCreatedAtDesc();
    List<WritingEntry> findBySeriesId(Long seriesId);
    void deleteBySeriesId(Long seriesId);
    void deleteByChildId(Long childId);
}
