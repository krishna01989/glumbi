package com.glumbi.repository;

import com.glumbi.entity.ReadQuizEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReadQuizRepository extends JpaRepository<ReadQuizEntry, Long> {
    List<ReadQuizEntry> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<ReadQuizEntry> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
}
