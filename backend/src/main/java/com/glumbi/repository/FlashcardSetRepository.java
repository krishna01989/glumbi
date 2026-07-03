package com.glumbi.repository;

import com.glumbi.entity.FlashcardSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, Long> {
    List<FlashcardSet> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<FlashcardSet> findTop20ByChildIdOrderByCreatedAtDesc(Long childId);
    List<FlashcardSet> findByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    long countByCreatedAtAfter(LocalDateTime since);
    List<FlashcardSet> findTop5ByOrderByCreatedAtDesc();
}
