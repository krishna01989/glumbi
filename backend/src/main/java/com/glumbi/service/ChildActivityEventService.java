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
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
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
            ev.setSyncedAt(LocalDateTime.now(ZoneOffset.UTC));

            LocalDateTime occurredAt = LocalDateTime.now(ZoneOffset.UTC);
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

    private static String normalizeTimezone(String tz) {
        if (tz == null || tz.isBlank()) return "UTC";
        return switch (tz) {
            case "Asia/Calcutta"    -> "Asia/Kolkata";
            case "Asia/Katmandu"    -> "Asia/Kathmandu";
            case "America/Godthab" -> "America/Nuuk";
            case "Pacific/Ponape"  -> "Pacific/Pohnpei";
            default -> tz;
        };
    }

    public Map<String, Object> getChildAnalytics(Long childId, Long userId, int days, String tz) {
        childRepo.findByIdAndOwnerId(childId, userId)
            .orElseThrow(() -> new RuntimeException("Child not found"));

        tz = normalizeTimezone(tz);
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

        // Performance metrics — accuracy, completions, flip efficiency
        Map<String, Map<String, Long>> perfRaw = new LinkedHashMap<>();
        for (Object[] row : repo.countPerformanceByFeatureForChild(childId, from)) {
            String feat = row[0].toString();
            String type = row[1].toString();
            long   cnt  = ((Number) row[2]).longValue();
            perfRaw.computeIfAbsent(feat, k -> new LinkedHashMap<>()).put(type, cnt);
        }
        // accuracyByFeature — features that have correct/wrong events
        Map<String, Object> accuracyByFeature = new LinkedHashMap<>();
        for (var entry : perfRaw.entrySet()) {
            long correct = entry.getValue().getOrDefault("correct", 0L);
            long wrong   = entry.getValue().getOrDefault("wrong",   0L);
            if (correct + wrong == 0) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("correct", correct);
            m.put("wrong",   wrong);
            m.put("rate",    Math.round((correct * 100.0) / (correct + wrong)));
            accuracyByFeature.put(entry.getKey(), m);
        }
        // completionsByFeature — features that have complete events
        Map<String, Long> completionsByFeature = new LinkedHashMap<>();
        for (var entry : perfRaw.entrySet()) {
            long completions = entry.getValue().getOrDefault("complete", 0L);
            if (completions > 0) completionsByFeature.put(entry.getKey(), completions);
        }
        // flipEfficiency — memory match: (match + mismatch) / completions
        double flipEfficiency = 0;
        if (perfRaw.containsKey("memorymatch")) {
            var mm = perfRaw.get("memorymatch");
            long flips = mm.getOrDefault("match", 0L) + mm.getOrDefault("mismatch", 0L);
            long comps = mm.getOrDefault("complete", 0L);
            if (comps > 0) flipEfficiency = Math.round((flips * 10.0) / comps) / 10.0;
        }

        // Streaks (all-time)
        int[] streaks = computeStreaks(repo.getDistinctActiveDates(childId));

        // Totals for the window
        long total         = repo.countByChildIdAndOccurredAtAfter(childId, from);
        long online        = repo.countByChildIdAndOnlineTrueAndOccurredAtAfter(childId, from);
        long totalSessions = featureBreakdown.values().stream().mapToLong(Long::longValue).sum();

        // Duration per feature (seconds) — session events only
        Map<String, Long> durationByFeature = new LinkedHashMap<>();
        long totalEngagementSeconds = 0;
        for (Object[] row : repo.sumDurationByFeatureForChild(childId, from)) {
            long sec = ((Number) row[1]).longValue();
            durationByFeature.put(row[0].toString(), sec);
            totalEngagementSeconds += sec;
        }

        // AI credits used by this parent's account in the window
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
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
        // Letter accuracy (Learn to Write — ai_validate events)
        List<Map<String, Object>> letterAccuracy = new ArrayList<>();
        for (Object[] row : repo.getLetterAccuracyForChild(childId, from)) {
            if (row[0] == null) continue;
            long passed = ((Number) row[2]).longValue();
            long tot    = ((Number) row[3]).longValue();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("letter", row[0].toString());
            m.put("script", row[1] != null ? row[1].toString() : "english");
            m.put("passed", passed);
            m.put("total",  tot);
            m.put("rate",   Math.round((passed * 100.0) / tot));
            letterAccuracy.add(m);
        }
        // Word accuracy (Learn to Write — ai_word events)
        List<Map<String, Object>> wordAccuracy = new ArrayList<>();
        for (Object[] row : repo.getWordAccuracyForChild(childId, from)) {
            if (row[0] == null) continue;
            long passed = ((Number) row[2]).longValue();
            long tot    = ((Number) row[3]).longValue();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("word",   row[0].toString());
            m.put("script", row[1] != null ? row[1].toString() : "english");
            m.put("passed", passed);
            m.put("total",  tot);
            m.put("rate",   Math.round((passed * 100.0) / tot));
            wordAccuracy.add(m);
        }
        // Maze: gave_up count + avg wall hits on complete
        long   mazeGaveUp  = repo.countByChildFeatureEventType(childId, "maze",    "gave_up",      from);
        Double mazeAvgWalls = repo.avgMazeWallHitsForChild(childId, from);
        // Riddle: hint count + glumbi reactions
        long riddleHints   = repo.countByChildFeatureEventType(childId, "riddle", "hint_used",     from);
        long riddleGlumbi  = repo.countByChildFeatureEventType(childId, "riddle", "glumbi_riddle", from);
        // Stories: similar_viewed count
        long storiesSimilar = repo.countByChildFeatureEventType(childId, "stories", "similar_viewed", from);
        // Learn: free practice attempts + favorite script + translation plays
        long learnPractice = repo.countByChildFeatureEventType(childId, "learn", "practice", from);
        long learnTranslationPlays = repo.countByChildFeatureEventType(childId, "learn", "translation_play", from);
        String favoriteScript = null;
        List<Object[]> fsRows = repo.getFavoriteScriptForChild(childId, from);
        if (!fsRows.isEmpty() && fsRows.get(0)[0] != null) {
            if (fsRows.size() >= 2) {
                long top = ((Number) fsRows.get(0)[1]).longValue();
                long second = ((Number) fsRows.get(1)[1]).longValue();
                favoriteScript = top > second
                    ? fsRows.get(0)[0].toString()
                    : fsRows.get(0)[0].toString() + "," + fsRows.get(1)[0].toString();
            } else {
                favoriteScript = fsRows.get(0)[0].toString();
            }
        }
        // MyWriting: avg word count at feedback time
        Double mywritingAvgWords = repo.avgWritingWordCountForChild(childId, from);
        // Memory match: top theme
        String topMemoryTheme = null;
        List<Object[]> themeRows = repo.getTopMemoryMatchThemeForChild(childId, from);
        if (!themeRows.isEmpty() && themeRows.get(0)[0] != null) topMemoryTheme = themeRows.get(0)[0].toString();
        // Draw: animate count
        long drawAnimateCount = repo.countByChildFeatureEventType(childId, "draw", "animate", from);
        // Glumbi Guide: stories
        long glumbiMidChoices      = repo.countByChildFeatureEventType(childId, "stories",   "glumbi_mid_choice",         from);
        long glumbiEpilogues       = repo.countByChildFeatureEventType(childId, "stories",   "glumbi_epilogue_requested", from);
        long glumbiPostResponses   = repo.countByChildFeatureEventType(childId, "stories",   "glumbi_post_response",      from);
        // Glumbi Guide: readquiz + curiosity
        long glumbiQuizReady       = repo.countByChildFeatureEventType(childId, "readquiz",  "glumbi_ready",              from);
        long glumbiFollowupChoices = repo.countByChildFeatureEventType(childId, "curiosity", "glumbi_followup_choice",    from);
        long glumbiCrossNavStories = repo.countByChildFeatureEventType(childId, "stories",   "glumbi_cross_nav",          from);
        long glumbiCrossNavReadquiz = repo.countByChildFeatureEventType(childId, "readquiz", "glumbi_cross_nav",          from);
        long glumbiCrossNavCuriosity = repo.countByChildFeatureEventType(childId, "curiosity","glumbi_cross_nav",         from);

        result.put("accuracyByFeature",      accuracyByFeature);
        result.put("completionsByFeature",   completionsByFeature);
        result.put("flipEfficiency",         flipEfficiency);
        result.put("letterAccuracy",         letterAccuracy);
        result.put("wordAccuracy",           wordAccuracy);
        result.put("mazeGaveUpCount",        mazeGaveUp);
        result.put("mazeAvgWallHits",        mazeAvgWalls != null ? mazeAvgWalls : 0);
        result.put("riddleHints",            riddleHints);
        result.put("riddleGlumbi",           riddleGlumbi);
        result.put("storiesSimilarViewed",   storiesSimilar);
        result.put("learnPracticeCount",     learnPractice);
        result.put("learnTranslationPlays",  learnTranslationPlays);
        result.put("learnFavoriteScript",    favoriteScript);
        result.put("mywritingAvgWordCount",  mywritingAvgWords != null ? mywritingAvgWords.longValue() : null);
        result.put("topMemoryMatchTheme",    topMemoryTheme);
        result.put("drawAnimateCount",         drawAnimateCount);
        result.put("glumbiMidChoices",         glumbiMidChoices);
        result.put("glumbiEpilogues",          glumbiEpilogues);
        result.put("glumbiPostResponses",      glumbiPostResponses);
        result.put("glumbiQuizReady",          glumbiQuizReady);
        result.put("glumbiFollowupChoices",    glumbiFollowupChoices);
        result.put("glumbiCrossNav",           glumbiCrossNavStories + glumbiCrossNavReadquiz + glumbiCrossNavCuriosity);
        result.put("totalEvents",            total);
        result.put("totalSessions",          totalSessions);
        result.put("onlineCount",            online);
        result.put("offlineCount",           total - online);
        result.put("creditsUsedInPeriod",    creditsUsed);
        return result;
    }

    // ── Admin analytics ───────────────────────────────────────────────────────

    public Map<String, Object> getAdminAnalytics(LocalDate fromDate, LocalDate toDate) {
        LocalDate effectiveFrom = fromDate != null ? fromDate : LocalDate.of(2020, 1, 1);
        LocalDate effectiveTo   = toDate   != null ? toDate   : LocalDate.now();
        LocalDateTime from = effectiveFrom.atStartOfDay();
        LocalDateTime toDateTime = effectiveTo.plusDays(1).atStartOfDay();
        long days = ChronoUnit.DAYS.between(effectiveFrom, effectiveTo) + 1;
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Daily active children — build full series, each item {date, count}
        Map<String, Long> dacMap = new LinkedHashMap<>();
        for (LocalDate d = effectiveFrom; !d.isAfter(effectiveTo); d = d.plusDays(1)) {
            dacMap.put(d.format(dateFmt), 0L);
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
        long totalSessions = featureBreakdown.values().stream().mapToLong(Long::longValue).sum();

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

        // Performance metrics — admin platform-wide
        Map<String, Map<String, Long>> adminPerfRaw = new LinkedHashMap<>();
        for (Object[] row : repo.countPerformanceByFeatureSince(from)) {
            String feat = row[0].toString();
            String type = row[1].toString();
            long   cnt  = ((Number) row[2]).longValue();
            adminPerfRaw.computeIfAbsent(feat, k -> new LinkedHashMap<>()).put(type, cnt);
        }
        Map<String, Object> adminAccuracyByFeature = new LinkedHashMap<>();
        for (var entry : adminPerfRaw.entrySet()) {
            long correct = entry.getValue().getOrDefault("correct", 0L);
            long wrong   = entry.getValue().getOrDefault("wrong",   0L);
            if (correct + wrong == 0) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("correct", correct);
            m.put("wrong",   wrong);
            m.put("rate",    Math.round((correct * 100.0) / (correct + wrong)));
            adminAccuracyByFeature.put(entry.getKey(), m);
        }
        Map<String, Long> adminCompletionsByFeature = new LinkedHashMap<>();
        for (var entry : adminPerfRaw.entrySet()) {
            long completions = entry.getValue().getOrDefault("complete", 0L);
            if (completions > 0) adminCompletionsByFeature.put(entry.getKey(), completions);
        }
        double adminFlipEfficiency = 0;
        if (adminPerfRaw.containsKey("memorymatch")) {
            var mm = adminPerfRaw.get("memorymatch");
            long flips = mm.getOrDefault("match", 0L) + mm.getOrDefault("mismatch", 0L);
            long comps = mm.getOrDefault("complete", 0L);
            if (comps > 0) adminFlipEfficiency = Math.round((flips * 10.0) / comps) / 10.0;
        }

        long totalCreditsUsed = usageLogRepo.sumCreditsInPeriod(from, toDateTime);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("days",                   days);
        result.put("dailyActiveChildren",    dailyActiveChildren);
        result.put("featureBreakdown",       featureBreakdown);
        result.put("durationByFeature",      durationByFeature);
        result.put("totalEngagementSeconds", totalEngagementSeconds);
        result.put("hourlyActivity",         hourlyActivity);
        result.put("heatmap",               heatmapRows);
        result.put("totalEvents",            total);
        result.put("totalSessions",          totalSessions);
        result.put("onlineCount",            online);
        result.put("offlineCount",           total - online);
        result.put("activeChildren",         activeChildren);
        // Platform-wide engagement signals
        long   adminMazeGaveUp   = repo.countByFeatureEventTypeSince("maze",    "gave_up",       from);
        Double adminMazeAvgWalls = repo.avgMazeWallHitsSince(from);
        long   adminRiddleHints  = repo.countByFeatureEventTypeSince("riddle",  "hint_used",     from);
        long   adminRiddleGlumbi = repo.countByFeatureEventTypeSince("riddle",  "glumbi_riddle", from);
        long   adminSimilarViewed    = repo.countByFeatureEventTypeSince("stories", "similar_viewed",from);
        long   adminLearnPractice    = repo.countByFeatureEventTypeSince("learn",   "practice",      from);
        long   adminLearnTranslations = repo.countByFeatureEventTypeSince("learn",  "translation_play", from);
        String adminTopScript = null;
        List<Object[]> atsRows = repo.getTopScriptPlatform(from);
        if (!atsRows.isEmpty() && atsRows.get(0)[0] != null) {
            if (atsRows.size() >= 2) {
                long top = ((Number) atsRows.get(0)[1]).longValue();
                long second = ((Number) atsRows.get(1)[1]).longValue();
                adminTopScript = top > second
                    ? atsRows.get(0)[0].toString()
                    : atsRows.get(0)[0].toString() + "," + atsRows.get(1)[0].toString();
            } else {
                adminTopScript = atsRows.get(0)[0].toString();
            }
        }

        result.put("accuracyByFeature",      adminAccuracyByFeature);
        result.put("completionsByFeature",   adminCompletionsByFeature);
        result.put("flipEfficiency",         adminFlipEfficiency);
        result.put("mazeGaveUpCount",        adminMazeGaveUp);
        result.put("mazeAvgWallHits",        adminMazeAvgWalls != null ? adminMazeAvgWalls : 0);
        result.put("riddleHints",            adminRiddleHints);
        result.put("riddleGlumbi",           adminRiddleGlumbi);
        result.put("storiesSimilarViewed",   adminSimilarViewed);
        result.put("learnPracticeCount",     adminLearnPractice);
        result.put("learnTranslationPlays",  adminLearnTranslations);
        result.put("learnFavoriteScript",    adminTopScript);
        // Glumbi Guide platform-wide
        long adminGlumbiMidChoices    = repo.countByFeatureEventTypeSince("stories",   "glumbi_mid_choice",         from);
        long adminGlumbiEpilogues     = repo.countByFeatureEventTypeSince("stories",   "glumbi_epilogue_requested", from);
        long adminGlumbiPostResponses = repo.countByFeatureEventTypeSince("stories",   "glumbi_post_response",      from);
        long adminGlumbiQuizReady     = repo.countByFeatureEventTypeSince("readquiz",  "glumbi_ready",              from);
        long adminGlumbiFollowups     = repo.countByFeatureEventTypeSince("curiosity", "glumbi_followup_choice",    from);
        long adminGlumbiCrossNav      = repo.countByFeatureEventTypeSince("stories",   "glumbi_cross_nav",          from)
                                      + repo.countByFeatureEventTypeSince("readquiz",  "glumbi_cross_nav",          from)
                                      + repo.countByFeatureEventTypeSince("curiosity", "glumbi_cross_nav",          from);
        result.put("glumbiMidChoices",       adminGlumbiMidChoices);
        result.put("glumbiEpilogues",        adminGlumbiEpilogues);
        result.put("glumbiPostResponses",    adminGlumbiPostResponses);
        result.put("glumbiQuizReady",        adminGlumbiQuizReady);
        result.put("glumbiFollowupChoices",  adminGlumbiFollowups);
        result.put("glumbiCrossNav",         adminGlumbiCrossNav);
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
