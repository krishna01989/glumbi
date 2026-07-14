package com.glumbi.service;

import com.glumbi.entity.ChildActivityEvent;
import com.glumbi.repository.AiUsageLogRepository;
import com.glumbi.repository.ChildActivityEventRepository;
import com.glumbi.repository.ChildRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChildActivityEventService {

    private final ChildActivityEventRepository repo;
    private final ChildRepository childRepo;
    private final AiUsageLogRepository usageLogRepo;

    public record EventDto(
        Long    childId,
        String  childName,
        String  feature,
        String  eventType,
        boolean online,
        Integer durationSeconds,
        String  metadata,
        String  occurredAt,
        String  clientKey
    ) {}

    // ── Batch ingest ──────────────────────────────────────────────────────────

    @Transactional
    public int saveBatch(List<EventDto> events, Long userId, String parentEmail) {
        int saved = 0;
        for (EventDto dto : events) {
            if (dto.childId() == null || dto.feature() == null || dto.eventType() == null) continue;
            if (dto.clientKey() != null && repo.existsByClientKey(dto.clientKey())) continue;
            if (!childRepo.findByIdAndOwnerId(dto.childId(), userId).isPresent()) continue;

            ChildActivityEvent ev = new ChildActivityEvent();
            ev.setChildId(dto.childId());
            ev.setUserId(userId);
            ev.setChildName(dto.childName() != null ? dto.childName() : "");
            ev.setParentEmail(parentEmail);
            ev.setFeature(dto.feature());
            ev.setEventType(dto.eventType());
            ev.setOnline(dto.online());
            ev.setDurationSeconds(dto.durationSeconds());
            ev.setMetadata(dto.metadata());
            ev.setClientKey(dto.clientKey());
            ev.setSyncedAt(LocalDateTime.now());

            LocalDateTime occurredAt = LocalDateTime.now();
            if (dto.occurredAt() != null) {
                try { occurredAt = LocalDateTime.parse(dto.occurredAt()); } catch (Exception ignored) {}
            }
            ev.setOccurredAt(occurredAt);

            repo.save(ev);
            saved++;
        }
        return saved;
    }

    // ── Child analytics ───────────────────────────────────────────────────────

    public Map<String, Object> getChildAnalytics(Long childId, Long userId, int days, String tz) {
        childRepo.findByIdAndOwnerId(childId, userId)
            .orElseThrow(() -> new RuntimeException("Child not found"));

        java.time.ZoneId zoneId = java.time.ZoneId.of(tz, java.time.ZoneId.SHORT_IDS);
        LocalDateTime from = LocalDateTime.now(zoneId).minusDays(days);
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Daily counts — build full series in the user's local date, fill in actuals
        Map<String, Long> dailyMap = new LinkedHashMap<>();
        LocalDate todayLocal = LocalDate.now(zoneId);
        for (int i = days - 1; i >= 0; i--) {
            dailyMap.put(todayLocal.minusDays(i).format(dateFmt), 0L);
        }
        for (Object[] row : repo.countByDateForChild(childId, from, tz)) {
            String day = row[0].toString();
            dailyMap.put(day, ((Number) row[1]).longValue());
        }
        List<Map<String, Object>> dailyCounts = new ArrayList<>();
        dailyMap.forEach((date, cnt) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", date); m.put("count", cnt);
            dailyCounts.add(m);
        });

        // Hourly distribution — flat 24-element array in user's local timezone
        long[] hourlyArr = new long[24];
        for (Object[] row : repo.countByHourForChild(childId, from, tz)) {
            int hr = ((Number) row[0]).intValue();
            hourlyArr[hr] = ((Number) row[1]).longValue();
        }
        List<Long> hourlyActivity = new ArrayList<>();
        for (long v : hourlyArr) hourlyActivity.add(v);

        // Feature breakdown — map of feature→count
        Map<String, Long> featureBreakdown = new LinkedHashMap<>();
        for (Object[] row : repo.countByFeatureForChild(childId, from)) {
            featureBreakdown.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        // Event type breakdown
        List<Map<String, Object>> byEventType = new ArrayList<>();
        for (Object[] row : repo.countByEventTypeForChild(childId, from)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("eventType", row[0]); m.put("count", ((Number) row[1]).longValue());
            byEventType.add(m);
        }

        // Streaks (all-time)
        int[] streaks = computeStreaks(repo.getDistinctActiveDates(childId));

        // Totals for the window
        long total   = repo.countByChildIdAndOccurredAtAfter(childId, from);
        long online  = repo.countByChildIdAndOnlineTrueAndOccurredAtAfter(childId, from);

        // Duration per feature (seconds) — session events only
        Map<String, Long> durationByFeature = new LinkedHashMap<>();
        long totalEngagementSeconds = 0;
        for (Object[] row : repo.sumDurationByFeatureForChild(childId, from)) {
            long sec = ((Number) row[1]).longValue();
            durationByFeature.put(row[0].toString(), sec);
            totalEngagementSeconds += sec;
        }

        // AI credits used by this parent's account in the window
        LocalDateTime now = LocalDateTime.now();
        long creditsUsed = usageLogRepo.sumCreditsByUser(userId, from, now);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("childId",                childId);
        result.put("days",                   days);
        result.put("dailyActivity",          dailyCounts);
        result.put("hourlyActivity",         hourlyActivity);
        result.put("featureBreakdown",       featureBreakdown);
        result.put("durationByFeature",      durationByFeature);
        result.put("totalEngagementSeconds", totalEngagementSeconds);
        result.put("byEventType",            byEventType);
        result.put("currentStreak",          streaks[0]);
        result.put("longestStreak",          streaks[1]);
        result.put("totalEvents",            total);
        result.put("onlineCount",            online);
        result.put("offlineCount",           total - online);
        result.put("creditsUsedInPeriod",    creditsUsed);
        return result;
    }

    // ── Admin analytics ───────────────────────────────────────────────────────

    public Map<String, Object> getAdminAnalytics(int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Daily active children — build full series, each item {date, count}
        Map<String, Long> dacMap = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            dacMap.put(LocalDate.now().minusDays(i).format(dateFmt), 0L);
        }
        for (Object[] row : repo.countDailyActiveChildrenSince(from)) {
            dacMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        List<Map<String, Object>> dailyActiveChildren = new ArrayList<>();
        dacMap.forEach((date, cnt) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", date); m.put("count", cnt);
            dailyActiveChildren.add(m);
        });

        // Feature breakdown — map of feature→count
        Map<String, Long> featureBreakdown = new LinkedHashMap<>();
        for (Object[] row : repo.countByFeatureSince(from)) {
            featureBreakdown.put(row[0].toString(), ((Number) row[1]).longValue());
        }

        // Hourly — flat 24-element array indexed by hour
        long[] hourlyArr = new long[24];
        for (Object[] row : repo.countByHourSince(from)) {
            int hr = ((Number) row[0]).intValue();
            hourlyArr[hr] = ((Number) row[1]).longValue();
        }
        List<Long> hourlyActivity = new ArrayList<>();
        for (long v : hourlyArr) hourlyActivity.add(v);

        long total  = repo.countByOccurredAtAfter(from);
        long online = repo.countByOnlineTrueAndOccurredAtAfter(from);
        long activeChildren = repo.countDistinctChildrenSince(from);

        // Duration per feature — session events only
        Map<String, Long> durationByFeature = new LinkedHashMap<>();
        long totalEngagementSeconds = 0;
        for (Object[] row : repo.sumDurationByFeatureSince(from)) {
            long sec = ((Number) row[1]).longValue();
            durationByFeature.put(row[0].toString(), sec);
            totalEngagementSeconds += sec;
        }

        // 7×24 heatmap: dow (0=Sun..6=Sat) × hour → count
        long[][] heatmap = new long[7][24];
        for (Object[] row : repo.countByHourAndDayOfWeekSince(from)) {
            int dow = ((Number) row[0]).intValue();
            int hr  = ((Number) row[1]).intValue();
            heatmap[dow][hr] = ((Number) row[2]).longValue();
        }
        // Flatten to list of rows for JSON — Sun first, then Mon–Sat
        List<Map<String, Object>> heatmapRows = new ArrayList<>();
        String[] dayNames = {"Sun","Mon","Tue","Wed","Thu","Fri","Sat"};
        for (int d = 0; d < 7; d++) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("day", dayNames[d]);
            List<Long> hours = new ArrayList<>();
            for (int h = 0; h < 24; h++) hours.add(heatmap[d][h]);
            row.put("hours", hours);
            heatmapRows.add(row);
        }

        LocalDateTime now = LocalDateTime.now();
        long totalCreditsUsed = usageLogRepo.sumCreditsInPeriod(from, now);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("days",                   days);
        result.put("dailyActiveChildren",    dailyActiveChildren);
        result.put("featureBreakdown",       featureBreakdown);
        result.put("durationByFeature",      durationByFeature);
        result.put("totalEngagementSeconds", totalEngagementSeconds);
        result.put("hourlyActivity",         hourlyActivity);
        result.put("heatmap",               heatmapRows);
        result.put("totalEvents",            total);
        result.put("onlineCount",            online);
        result.put("offlineCount",           total - online);
        result.put("activeChildren",         activeChildren);
        result.put("totalCreditsUsed",       totalCreditsUsed);
        return result;
    }

    // ── Streak helper ─────────────────────────────────────────────────────────

    private int[] computeStreaks(List<java.sql.Date> rawDates) {
        if (rawDates.isEmpty()) return new int[]{0, 0};
        List<LocalDate> sorted = rawDates.stream()
            .map(java.sql.Date::toLocalDate)
            .distinct()
            .sorted(Comparator.reverseOrder())
            .toList();

        LocalDate today     = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        int current = 0;
        if (sorted.get(0).equals(today) || sorted.get(0).equals(yesterday)) {
            current = 1;
            for (int i = 1; i < sorted.size(); i++) {
                if (sorted.get(i).equals(sorted.get(i - 1).minusDays(1))) current++;
                else break;
            }
        }

        int longest = 0, run = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).equals(sorted.get(i - 1).minusDays(1))) {
                run++;
            } else {
                longest = Math.max(longest, run);
                run = 1;
            }
        }
        longest = Math.max(longest, Math.max(run, current));

        return new int[]{current, longest};
    }
}
