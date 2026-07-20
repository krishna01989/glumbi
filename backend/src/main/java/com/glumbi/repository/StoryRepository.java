package com.glumbi.repository;

import com.glumbi.entity.Story;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByChildIdOrderByCreatedAtDesc(Long childId);
    Page<Story> findByChildIdAndSeriesIdIsNullOrderByCreatedAtDesc(Long childId, Pageable pageable);
    List<Story> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    List<Story> findByChildIdAndFavoriteTrueOrderByCreatedAtDesc(Long childId);
    void deleteByChildId(Long childId);
    long countByCreatedAtAfter(LocalDateTime since);
    long countByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    List<Story> findTop10ByOrderByCreatedAtDesc();
    List<Story> findBySeriesId(Long seriesId);
    void deleteBySeriesId(Long seriesId);

    @Query("SELECT s.child.id, COUNT(s) FROM Story s GROUP BY s.child.id")
    List<Object[]> countStoriesPerChild();

    List<Story> findByCreatedAtAfter(LocalDateTime since);

    // Update embedding with explicit cast — JPA can't map String → vector automatically
    @Modifying
    @Query(value = "UPDATE stories SET embedding = CAST(:embedding AS vector) WHERE id = :id", nativeQuery = true)
    void updateEmbedding(@Param("id") Long id, @Param("embedding") String embedding);

    // Similarity search using a raw embedding string — used only at generate time
    @Query(value = """
        SELECT * FROM stories
        WHERE child_id = :childId
          AND embedding IS NOT NULL
          AND id != :excludeId
          AND series_id IS NULL
        ORDER BY embedding <-> CAST(:embedding AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<Story> findSimilarStories(
        @Param("childId")   Long   childId,
        @Param("embedding") String embedding,
        @Param("excludeId") Long   excludeId,
        @Param("limit")     int    limit
    );

    // Similarity search using a story's own stored embedding — no Voyage AI call needed
    @Query(value = """
        SELECT s.* FROM stories s
        JOIN stories ref ON ref.id = :storyId
        WHERE s.child_id = :childId
          AND s.embedding IS NOT NULL
          AND s.id != :storyId
          AND ref.embedding IS NOT NULL
          AND s.series_id IS NULL
          AND (s.embedding <-> ref.embedding) < 0.9
        ORDER BY s.embedding <-> ref.embedding
        LIMIT :limit
        """, nativeQuery = true)
    List<Story> findSimilarByStoredEmbedding(
        @Param("childId") Long childId,
        @Param("storyId") Long storyId,
        @Param("limit")   int  limit
    );
}
