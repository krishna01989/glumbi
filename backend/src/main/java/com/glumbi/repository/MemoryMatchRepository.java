package com.glumbi.repository;

import com.glumbi.entity.MemoryMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MemoryMatchRepository extends JpaRepository<MemoryMatch, Long> {
    List<MemoryMatch> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<MemoryMatch> findTop10ByChildIdOrderByCreatedAtDesc(Long childId);
    long countByCreatedAtAfter(LocalDateTime since);
    long countByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    List<MemoryMatch> findTop5ByOrderByCreatedAtDesc();
    List<MemoryMatch> findByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
}
