package com.glumbi.repository;

import com.glumbi.entity.FlashcardSet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, Long> {
    List<FlashcardSet> findByChildIdOrderByCreatedAtDesc(Long childId);
    Page<FlashcardSet> findByChildIdOrderByCreatedAtDesc(Long childId, Pageable pageable);
    List<FlashcardSet> findTop20ByChildIdOrderByCreatedAtDesc(Long childId);
    List<FlashcardSet> findByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    long countByCreatedAtAfter(LocalDateTime since);
    long countByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    List<FlashcardSet> findTop5ByOrderByCreatedAtDesc();
    void deleteByChildId(Long childId);
}
