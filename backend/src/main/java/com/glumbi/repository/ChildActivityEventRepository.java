package com.glumbi.repository;

import com.glumbi.entity.ChildActivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
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
        WHERE child_id = :childId AND occurred_at >= :from
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
        WHERE occurred_at >= :from
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
