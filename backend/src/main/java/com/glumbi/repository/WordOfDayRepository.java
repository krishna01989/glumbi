package com.glumbi.repository;

import com.glumbi.entity.WordOfDay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WordOfDayRepository extends JpaRepository<WordOfDay, Long> {
    Optional<WordOfDay> findByChildIdAndDate(Long childId, LocalDate date);
    long countByChildIdAndDateBetween(Long childId, LocalDate from, LocalDate to);
    List<WordOfDay> findByChildIdOrderByDateDesc(Long childId);
    List<WordOfDay> findTop30ByChildIdOrderByDateDesc(Long childId);
    List<WordOfDay> findTop60ByChildIdOrderByDateDesc(Long childId);
    Page<WordOfDay> findByChildIdOrderByDateDesc(Long childId, Pageable pageable);
    long countByCreatedAtAfter(LocalDateTime since);
    List<WordOfDay> findTop5ByOrderByCreatedAtDesc();
    boolean existsByChildIdAndWordIgnoreCase(Long childId, String word);
    void deleteByChildId(Long childId);
}
