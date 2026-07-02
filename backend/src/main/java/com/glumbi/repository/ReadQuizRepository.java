package com.glumbi.repository;

import com.glumbi.entity.ReadQuizEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ReadQuizRepository extends JpaRepository<ReadQuizEntry, Long> {
    List<ReadQuizEntry> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<ReadQuizEntry> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    long countByCreatedAtAfter(LocalDateTime since);

    @Query("SELECT q.score, COUNT(q) FROM ReadQuizEntry q WHERE q.completed = true AND q.score IS NOT NULL GROUP BY q.score")
    List<Object[]> countByScore();

    @Query("SELECT q.score, COUNT(q) FROM ReadQuizEntry q WHERE q.completed = true AND q.score IS NOT NULL AND q.createdAt > :since GROUP BY q.score")
    List<Object[]> countByScoreAfter(@org.springframework.data.repository.query.Param("since") LocalDateTime since);

    @Query("SELECT q.child.id, COUNT(q) FROM ReadQuizEntry q GROUP BY q.child.id")
    List<Object[]> countStoriesPerChild();
    List<ReadQuizEntry> findTop5ByCompletedTrueOrderByCreatedAtDesc();
}
