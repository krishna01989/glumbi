package com.glumbi.repository;

import com.glumbi.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {

    /** Per-child, per-feature credit totals for a user within a time window. */
    @Query("""
        SELECT l.childId, l.featureName, SUM(l.creditsUsed), COUNT(l)
        FROM AiUsageLog l
        WHERE l.userId = :userId
          AND l.childId IS NOT NULL
          AND l.usedAt BETWEEN :from AND :to
        GROUP BY l.childId, l.featureName
        """)
    List<Object[]> sumByChildAndFeature(
        @Param("userId") Long userId,
        @Param("from")   LocalDateTime from,
        @Param("to")     LocalDateTime to
    );

    /** Total credits consumed across ALL users in a time window (for admin dashboard). */
    @Query("SELECT COALESCE(SUM(l.creditsUsed), 0) FROM AiUsageLog l WHERE l.usedAt BETWEEN :from AND :to")
    long sumCreditsInPeriod(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Total credits consumed by a single user in a time window (for parent quota display). */
    @Query("SELECT COALESCE(SUM(l.creditsUsed), 0) FROM AiUsageLog l WHERE l.userId = :userId AND l.usedAt BETWEEN :from AND :to")
    long sumCreditsByUser(@Param("userId") Long userId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Per-user credit totals in a time window — returns [userId, total]. One query for all users. */
    @Query("SELECT l.userId, COALESCE(SUM(l.creditsUsed), 0) FROM AiUsageLog l WHERE l.usedAt BETWEEN :from AND :to GROUP BY l.userId")
    List<Object[]> sumPerUserInPeriod(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Anonymise rather than delete — credit history is platform analytics
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE AiUsageLog l SET l.userId = 0 WHERE l.userId = :userId")
    void anonymiseByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE AiUsageLog l SET l.childId = NULL WHERE l.childId = :childId")
    void anonymiseByChildId(@org.springframework.data.repository.query.Param("childId") Long childId);
}
