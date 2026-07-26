package com.glumbi.repository;

import com.glumbi.entity.JournalEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface JournalRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByChildIdOrderByCreatedAtDesc(Long childId);
    Page<JournalEntry> findByChildIdOrderByCreatedAtDesc(Long childId, Pageable pageable);
    List<JournalEntry> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    long countByChildId(Long childId);
    void deleteByChildId(Long childId);
}
