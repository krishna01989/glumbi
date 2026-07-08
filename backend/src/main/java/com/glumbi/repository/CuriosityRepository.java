package com.glumbi.repository;

import com.glumbi.entity.CuriosityEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CuriosityRepository extends JpaRepository<CuriosityEntry, Long> {
    List<CuriosityEntry> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<CuriosityEntry> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    void deleteByChildId(Long childId);
    long countByChildIdAndCreatedAtBetween(Long childId, LocalDateTime from, LocalDateTime to);
    List<CuriosityEntry> findTop5ByOrderByCreatedAtDesc();

    @Modifying
    @Query(value = "UPDATE curiosity_entries SET embedding = CAST(:embedding AS vector) WHERE id = :id", nativeQuery = true)
    void updateEmbedding(@Param("id") Long id, @Param("embedding") String embedding);

    @Query(value = """
        SELECT c.* FROM curiosity_entries c
        JOIN curiosity_entries ref ON ref.id = :entryId
        WHERE c.child_id = :childId
          AND c.embedding IS NOT NULL
          AND c.id != :entryId
          AND ref.embedding IS NOT NULL
          AND (c.embedding <-> ref.embedding) < 0.9
        ORDER BY c.embedding <-> ref.embedding
        LIMIT :limit
        """, nativeQuery = true)
    List<CuriosityEntry> findSimilarByStoredEmbedding(
        @Param("childId")  Long childId,
        @Param("entryId")  Long entryId,
        @Param("limit")    int  limit
    );
}
