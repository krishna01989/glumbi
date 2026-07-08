package com.glumbi.repository;

import com.glumbi.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<Activity> findByChildIdAndCategoryNotOrderByCreatedAtDesc(Long childId, String category);
    List<Activity> findByChildIdAndCategoryNotAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, String category, LocalDateTime from, LocalDateTime to);
    List<Activity> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    List<Activity> findByChildIdAndCompletedTrueOrderByCreatedAtDesc(Long childId);
    List<Activity> findByChildIdAndCategoryAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, String category, LocalDateTime from, LocalDateTime to);
    void deleteByChildId(Long childId);
    void deleteByChildIdAndCompletedFalse(Long childId);
    List<Activity> findByChildIdAndCompletedTrueAndCreatedAtAfterOrderByCreatedAtDesc(Long childId, LocalDateTime since);
    long countByCreatedAtAfter(LocalDateTime since);
    long countByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    List<Activity> findTop5ByCategoryNotOrderByCreatedAtDesc(String category);

    @Modifying
    @Query(value = "UPDATE activities SET embedding = CAST(:embedding AS vector) WHERE id = :id", nativeQuery = true)
    void updateEmbedding(@Param("id") Long id, @Param("embedding") String embedding);

    @Query(value = """
        SELECT a.* FROM activities a
        JOIN activities ref ON ref.id = :activityId
        WHERE a.child_id = :childId
          AND a.completed = true
          AND a.embedding IS NOT NULL
          AND a.id != :activityId
          AND ref.embedding IS NOT NULL
          AND (a.embedding <-> ref.embedding) < 0.9
        ORDER BY a.embedding <-> ref.embedding
        LIMIT :limit
        """, nativeQuery = true)
    List<Activity> findSimilarByStoredEmbedding(
        @Param("childId")    Long childId,
        @Param("activityId") Long activityId,
        @Param("limit")      int  limit
    );
}
