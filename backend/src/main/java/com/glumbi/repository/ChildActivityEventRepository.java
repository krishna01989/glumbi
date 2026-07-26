package com.glumbi.repository;

import com.glumbi.entity.ChildActivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ChildActivityEventRepository extends JpaRepository<ChildActivityEvent, Long> {

    boolean existsByClientKey(String clientKey);

    // ── Child analytics ───────────────────────────────────────────────────────

    @Query(value = """
        SELECT DATE((occurred_at AT TIME ZONE 'UTC') AT TIME ZONE :tz) AS day, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE child_id = :childId AND occurred_at >= :from
        GROUP BY 1
        ORDER BY 1
        """, nativeQuery = true)
    List<Object[]> countByDateForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from, @Param("tz") String tz);

    @Query(value = """
        SELECT CAST(EXTRACT(HOUR FROM ((occurred_at AT TIME ZONE 'UTC') AT TIME ZONE :tz)) AS integer) AS hr, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE child_id = :childId AND occurred_at >= :from
        GROUP BY 1
        ORDER BY 1
        """, nativeQuery = true)
    List<Object[]> countByHourForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from, @Param("tz") String tz);

    @Query(value = """
        SELECT feature, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE child_id = :childId AND event_type = 'session' AND occurred_at >= :from
        GROUP BY feature
        ORDER BY cnt DESC
        """, nativeQuery = true)
    List<Object[]> countByFeatureForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    @Query(value = """
        SELECT event_type, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE child_id = :childId AND occurred_at >= :from
        GROUP BY event_type
        ORDER BY cnt DESC
        """, nativeQuery = true)
    List<Object[]> countByEventTypeForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    @Query(value = """
        SELECT feature, COALESCE(SUM(duration_seconds), 0) AS total_sec
        FROM child_activity_events
        WHERE child_id = :childId
          AND event_type = 'session'
          AND duration_seconds IS NOT NULL
          AND occurred_at >= :from
        GROUP BY feature
        ORDER BY total_sec DESC
        """, nativeQuery = true)
    List<Object[]> sumDurationByFeatureForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // All-time active dates for streak calculation
    @Query(value = """
        SELECT DISTINCT DATE(occurred_at)
        FROM child_activity_events
        WHERE child_id = :childId
        ORDER BY 1 DESC
        """, nativeQuery = true)
    List<java.sql.Date> getDistinctActiveDates(@Param("childId") Long childId);

    // Performance events (correct/wrong/match/mismatch/complete) grouped by feature + type
    @Query(value = """
        SELECT feature, event_type, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE child_id = :childId
          AND event_type IN ('correct','wrong','match','mismatch','complete')
          AND occurred_at >= :from
        GROUP BY feature, event_type
        """, nativeQuery = true)
    List<Object[]> countPerformanceByFeatureForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // Admin version — platform-wide
    @Query(value = """
        SELECT feature, event_type, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE event_type IN ('correct','wrong','match','mismatch','complete')
          AND occurred_at >= :from
        GROUP BY feature, event_type
        """, nativeQuery = true)
    List<Object[]> countPerformanceByFeatureSince(@Param("from") LocalDateTime from);

    // Generic count by feature + event type — used for hint_used, similar_viewed, gave_up, etc.
    @Query(value = "SELECT COUNT(*) FROM child_activity_events WHERE child_id = :childId AND feature = :feature AND event_type = :eventType AND occurred_at >= :from",
           nativeQuery = true)
    long countByChildFeatureEventType(@Param("childId") Long childId, @Param("feature") String feature, @Param("eventType") String eventType, @Param("from") LocalDateTime from);

    // Admin version (platform-wide)
    @Query(value = "SELECT COUNT(*) FROM child_activity_events WHERE feature = :feature AND event_type = :eventType AND occurred_at >= :from",
           nativeQuery = true)
    long countByFeatureEventTypeSince(@Param("feature") String feature, @Param("eventType") String eventType, @Param("from") LocalDateTime from);

    // Letter accuracy from ai_validate metadata
    @Query(value = """
        SELECT CAST(metadata AS json)->>'letter' AS letter,
               CAST(metadata AS json)->>'script' AS script,
               SUM(CASE WHEN CAST(CAST(metadata AS json)->>'correct' AS boolean) THEN 1 ELSE 0 END) AS passed,
               COUNT(*) AS total
        FROM child_activity_events
        WHERE child_id = :childId AND feature = 'learn' AND event_type = 'ai_validate'
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'letter' IS NOT NULL
        GROUP BY letter, script
        ORDER BY (SUM(CASE WHEN CAST(CAST(metadata AS json)->>'correct' AS boolean) THEN 1 ELSE 0 END) / CAST(COUNT(*) AS float)) ASC
        """, nativeQuery = true)
    List<Object[]> getLetterAccuracyForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // Word accuracy from ai_word metadata
    @Query(value = """
        SELECT CAST(metadata AS json)->>'word' AS word,
               CAST(metadata AS json)->>'script' AS script,
               SUM(CASE WHEN CAST(CAST(metadata AS json)->>'correct' AS boolean) THEN 1 ELSE 0 END) AS passed,
               COUNT(*) AS total
        FROM child_activity_events
        WHERE child_id = :childId AND feature = 'learn' AND event_type = 'ai_word'
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'word' IS NOT NULL
        GROUP BY word, script
        ORDER BY (SUM(CASE WHEN CAST(CAST(metadata AS json)->>'correct' AS boolean) THEN 1 ELSE 0 END) / CAST(COUNT(*) AS float)) ASC
        """, nativeQuery = true)
    List<Object[]> getWordAccuracyForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // Favorite script (most ai_validate + ai_word events by script)
    @Query(value = """
        SELECT CAST(metadata AS json)->>'script' AS script, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE child_id = :childId AND feature = 'learn'
          AND event_type IN ('ai_validate','ai_word')
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'script' IS NOT NULL
        GROUP BY script ORDER BY cnt DESC LIMIT 2
        """, nativeQuery = true)
    List<Object[]> getFavoriteScriptForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // Platform-wide favorite script
    @Query(value = """
        SELECT CAST(metadata AS json)->>'script' AS script, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE feature = 'learn'
          AND event_type IN ('ai_validate','ai_word')
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'script' IS NOT NULL
        GROUP BY script ORDER BY cnt DESC LIMIT 2
        """, nativeQuery = true)
    List<Object[]> getTopScriptPlatform(@Param("from") LocalDateTime from);

    // Avg wall hits from maze complete events
    @Query(value = """
        SELECT ROUND(AVG(CAST(CAST(metadata AS json)->>'wallHits' AS integer)), 1)
        FROM child_activity_events
        WHERE child_id = :childId AND feature = 'maze' AND event_type = 'complete'
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'wallHits' IS NOT NULL
        """, nativeQuery = true)
    Double avgMazeWallHitsForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // Admin version (platform-wide)
    @Query(value = """
        SELECT ROUND(AVG(CAST(CAST(metadata AS json)->>'wallHits' AS integer)), 1)
        FROM child_activity_events
        WHERE feature = 'maze' AND event_type = 'complete'
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'wallHits' IS NOT NULL
        """, nativeQuery = true)
    Double avgMazeWallHitsSince(@Param("from") LocalDateTime from);

    // Avg word count from mywriting feedback events
    @Query(value = """
        SELECT ROUND(AVG(CAST(CAST(metadata AS json)->>'wordCount' AS integer)))
        FROM child_activity_events
        WHERE child_id = :childId AND feature = 'mywriting' AND event_type = 'feedback'
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'wordCount' IS NOT NULL
        """, nativeQuery = true)
    Double avgWritingWordCountForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // Top memory match theme from session events
    @Query(value = """
        SELECT CAST(metadata AS json)->>'theme' AS theme, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE child_id = :childId AND feature = 'memorymatch' AND event_type = 'session'
          AND occurred_at >= :from AND metadata IS NOT NULL
          AND CAST(metadata AS json)->>'theme' IS NOT NULL
        GROUP BY theme ORDER BY cnt DESC LIMIT 1
        """, nativeQuery = true)
    List<Object[]> getTopMemoryMatchThemeForChild(@Param("childId") Long childId, @Param("from") LocalDateTime from);

    // Recent Glumbi interactions for memory context — ordered newest-first, limited to last N events
    @Query(value = """
        SELECT feature, event_type, metadata, occurred_at
        FROM child_activity_events
        WHERE child_id = :childId
          AND event_type IN ('glumbi_mid_choice','glumbi_followup_choice','glumbi_ready','glumbi_riddle')
          AND metadata IS NOT NULL
        ORDER BY occurred_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findRecentGlumbiEvents(@Param("childId") Long childId, @Param("limit") int limit);

    // Anonymise rather than delete — retain aggregates, strip PII
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "UPDATE child_activity_events SET child_id = NULL, user_id = NULL, child_name = NULL, parent_email = NULL WHERE child_id = :childId", nativeQuery = true)
    void anonymiseByChildId(@Param("childId") Long childId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "UPDATE child_activity_events SET user_id = NULL WHERE user_id = :userId", nativeQuery = true)
    void anonymiseByUserId(@Param("userId") Long userId);

    long countByChildId(Long childId);
    long countByChildIdAndOnlineTrue(Long childId);
    long countByChildIdAndOccurredAtAfter(Long childId, LocalDateTime from);
    long countByChildIdAndOnlineTrueAndOccurredAtAfter(Long childId, LocalDateTime from);

    // ── Admin analytics ───────────────────────────────────────────────────────

    @Query(value = """
        SELECT DATE(occurred_at) AS day, COUNT(DISTINCT child_id) AS active
        FROM child_activity_events
        WHERE occurred_at >= :from
        GROUP BY DATE(occurred_at)
        ORDER BY DATE(occurred_at)
        """, nativeQuery = true)
    List<Object[]> countDailyActiveChildrenSince(@Param("from") LocalDateTime from);

    @Query(value = """
        SELECT feature, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE event_type = 'session' AND occurred_at >= :from
        GROUP BY feature
        ORDER BY cnt DESC
        """, nativeQuery = true)
    List<Object[]> countByFeatureSince(@Param("from") LocalDateTime from);

    @Query(value = """
        SELECT CAST(EXTRACT(HOUR FROM occurred_at) AS integer) AS hr, COUNT(*) AS cnt
        FROM child_activity_events
        WHERE occurred_at >= :from
        GROUP BY hr
        ORDER BY hr
        """, nativeQuery = true)
    List<Object[]> countByHourSince(@Param("from") LocalDateTime from);

    @Query(value = """
        SELECT feature, COALESCE(SUM(duration_seconds), 0) AS total_sec
        FROM child_activity_events
        WHERE event_type = 'session'
          AND duration_seconds IS NOT NULL
          AND occurred_at >= :from
        GROUP BY feature
        ORDER BY total_sec DESC
        """, nativeQuery = true)
    List<Object[]> sumDurationByFeatureSince(@Param("from") LocalDateTime from);

    @Query(value = """
        SELECT CAST(EXTRACT(DOW  FROM occurred_at) AS integer) AS dow,
               CAST(EXTRACT(HOUR FROM occurred_at) AS integer) AS hr,
               COUNT(*) AS cnt
        FROM child_activity_events
        WHERE occurred_at >= :from
        GROUP BY dow, hr
        ORDER BY dow, hr
        """, nativeQuery = true)
    List<Object[]> countByHourAndDayOfWeekSince(@Param("from") LocalDateTime from);

    long countByOccurredAtAfter(LocalDateTime from);
    long countByOnlineTrueAndOccurredAtAfter(LocalDateTime from);

    @Query(value = "SELECT COUNT(DISTINCT child_id) FROM child_activity_events WHERE occurred_at >= :from",
           nativeQuery = true)
    long countDistinctChildrenSince(@Param("from") LocalDateTime from);
}
