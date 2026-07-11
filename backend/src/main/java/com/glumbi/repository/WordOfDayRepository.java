package com.glumbi.repository;

import com.glumbi.entity.WordOfDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WordOfDayRepository extends JpaRepository<WordOfDay, Long> {
    Optional<WordOfDay> findByChildIdAndDate(Long childId, LocalDate date);
    long countByChildIdAndDateBetween(Long childId, LocalDate from, LocalDate to);
    List<WordOfDay> findByChildIdOrderByDateDesc(Long childId);
    long countByCreatedAtAfter(LocalDateTime since);
    List<WordOfDay> findTop5ByOrderByCreatedAtDesc();
    void deleteByChildId(Long childId);
}
