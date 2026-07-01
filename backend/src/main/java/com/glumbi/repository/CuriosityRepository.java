package com.glumbi.repository;

import com.glumbi.entity.CuriosityEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CuriosityRepository extends JpaRepository<CuriosityEntry, Long> {
    List<CuriosityEntry> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<CuriosityEntry> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    void deleteByChildId(Long childId);
}
