package com.glumbi.repository;

import com.glumbi.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<Story> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    List<Story> findByChildIdAndFavoriteTrueOrderByCreatedAtDesc(Long childId);
    void deleteByChildId(Long childId);
    long countByCreatedAtAfter(LocalDateTime since);
    List<Story> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT s.child.id, COUNT(s) FROM Story s GROUP BY s.child.id")
    List<Object[]> countStoriesPerChild();

    List<Story> findByCreatedAtAfter(LocalDateTime since);
}
