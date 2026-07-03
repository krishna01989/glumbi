package com.glumbi.service;

import com.glumbi.repository.ChildRepository;
import com.glumbi.security.JwtFilter.AuthUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class TimelineService {

    @PersistenceContext
    private EntityManager em;

    private final ChildRepository childRepository;

    public TimelineService(ChildRepository childRepository) {
        this.childRepository = childRepository;
    }

    public Map<String, Object> getPage(Long childId, int page, int size, String from, String to) {
        LocalDateTime fromDt = from != null ? LocalDateTime.parse(from, DateTimeFormatter.ISO_DATE_TIME) : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime toDt   = to   != null ? LocalDateTime.parse(to,   DateTimeFormatter.ISO_DATE_TIME) : LocalDateTime.now().plusDays(1);

        String unionSql = buildUnionSql();

        // count total
        long total = ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM (" + unionSql + ") t")
                .setParameter(1, childId).setParameter(2, fromDt).setParameter(3, toDt)
                .setParameter(4, childId).setParameter(5, fromDt).setParameter(6, toDt)
                .setParameter(7, childId).setParameter(8, fromDt).setParameter(9, toDt)
                .setParameter(10, childId).setParameter(11, fromDt).setParameter(12, toDt)
                .setParameter(13, childId).setParameter(14, fromDt).setParameter(15, toDt)
                .setParameter(16, childId).setParameter(17, fromDt).setParameter(18, toDt)
                .setParameter(19, childId).setParameter(20, fromDt).setParameter(21, toDt)
                .setParameter(22, childId).setParameter(23, fromDt).setParameter(24, toDt)
                .setParameter(25, childId).setParameter(26, fromDt).setParameter(27, toDt)
                .getSingleResult()).longValue();

        int totalPages = (int) Math.ceil((double) total / size);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
                unionSql + " ORDER BY created_at DESC LIMIT :size OFFSET :offset")
                .setParameter(1, childId).setParameter(2, fromDt).setParameter(3, toDt)
                .setParameter(4, childId).setParameter(5, fromDt).setParameter(6, toDt)
                .setParameter(7, childId).setParameter(8, fromDt).setParameter(9, toDt)
                .setParameter(10, childId).setParameter(11, fromDt).setParameter(12, toDt)
                .setParameter(13, childId).setParameter(14, fromDt).setParameter(15, toDt)
                .setParameter(16, childId).setParameter(17, fromDt).setParameter(18, toDt)
                .setParameter(19, childId).setParameter(20, fromDt).setParameter(21, toDt)
                .setParameter(22, childId).setParameter(23, fromDt).setParameter(24, toDt)
                .setParameter(25, childId).setParameter(26, fromDt).setParameter(27, toDt)
                .setParameter("size", size)
                .setParameter("offset", page * size)
                .getResultList();

        List<Map<String, Object>> items = rows.stream().map(this::rowToMap).toList();

        return Map.of(
                "items", items,
                "page", page,
                "totalPages", totalPages,
                "totalItems", total
        );
    }

    private String buildUnionSql() {
        // Each SELECT must return the same columns:
        // id, type, created_at, title, content, extra1, extra2, extra3, extra4, extra5
        // extra columns carry type-specific data as JSON-friendly strings
        return """
            SELECT id, 'story' AS type, created_at,
                   title, SUBSTRING(content,1,200) AS content,
                   keywords AS extra1, CAST(favorite AS CHAR) AS extra2,
                   NULL AS extra3, NULL AS extra4, NULL AS extra5
              FROM stories WHERE child_id = ?1 AND created_at BETWEEN ?2 AND ?3

            UNION ALL

            SELECT id, 'journal' AS type, created_at,
                   NULL AS title, content,
                   mood AS extra1, milestone AS extra2,
                   NULL AS extra3, NULL AS extra4, NULL AS extra5
              FROM journal_entries WHERE child_id = ?4 AND created_at BETWEEN ?5 AND ?6

            UNION ALL

            SELECT id, CASE WHEN category = 'learn' THEN 'learn' ELSE 'activity' END AS type, created_at,
                   title, description AS content,
                   emoji AS extra1, CAST(completed AS CHAR) AS extra2,
                   CAST(rating AS CHAR) AS extra3, duration AS extra4, NULL AS extra5
              FROM activities WHERE child_id = ?7 AND created_at BETWEEN ?8 AND ?9

            UNION ALL

            SELECT id, 'curiosity' AS type, created_at,
                   question AS title, SUBSTRING(fun_fact1,1,200) AS content,
                   sticker AS extra1, NULL AS extra2,
                   NULL AS extra3, NULL AS extra4, NULL AS extra5
              FROM curiosity_entries WHERE child_id = ?10 AND created_at BETWEEN ?11 AND ?12

            UNION ALL

            SELECT id, 'readquiz' AS type, created_at,
                   title, NULL AS content,
                   topic AS extra1, reading_time AS extra2,
                   lesson AS extra3, CAST(score AS CHAR) AS extra4, CAST(completed AS CHAR) AS extra5
              FROM read_quiz_entries WHERE child_id = ?13 AND created_at BETWEEN ?14 AND ?15

            UNION ALL

            SELECT id, 'writing' AS type, created_at,
                   title, SUBSTRING(content,1,200) AS content,
                   badge AS extra1, star_word AS extra2,
                   CAST(feedback_received AS CHAR) AS extra3, NULL AS extra4, NULL AS extra5
              FROM writing_entries WHERE child_id = ?16 AND created_at BETWEEN ?17 AND ?18

            UNION ALL

            SELECT id, 'flashcards' AS type, created_at,
                   topic AS title, NULL AS content,
                   NULL AS extra1, NULL AS extra2,
                   NULL AS extra3, NULL AS extra4, NULL AS extra5
              FROM flashcard_sets WHERE child_id = ?19 AND created_at BETWEEN ?20 AND ?21

            UNION ALL

            SELECT id, 'wordofday' AS type, created_at,
                   word AS title, meaning AS content,
                   emoji AS extra1, example_sentence AS extra2,
                   NULL AS extra3, NULL AS extra4, NULL AS extra5
              FROM word_of_day WHERE child_id = ?22 AND created_at BETWEEN ?23 AND ?24

            UNION ALL

            SELECT id, 'memorymatch' AS type, created_at,
                   theme AS title, NULL AS content,
                   NULL AS extra1, NULL AS extra2,
                   NULL AS extra3, NULL AS extra4, NULL AS extra5
              FROM memory_matches WHERE child_id = ?25 AND created_at BETWEEN ?26 AND ?27
            """;
    }

    private Map<String, Object> rowToMap(Object[] r) {
        String type = (String) r[1];
        Map<String, Object> m = new java.util.HashMap<>();
        m.put("id",        r[0]);
        m.put("type",      type);
        m.put("createdAt", r[2] != null ? r[2].toString() : null);
        m.put("title",     r[3]);
        m.put("content",   r[4]);

        String e1 = (String) r[5];
        String e2 = (String) r[6];
        String e3 = (String) r[7];
        String e4 = (String) r[8];
        String e5 = (String) r[9];

        switch (type) {
            case "story"      -> { m.put("keywords", e1); m.put("favorite",  "1".equals(e2) || "true".equals(e2)); }
            case "journal"    -> { m.put("mood", e1);      m.put("milestone", e2); }
            case "activity",
                 "learn"      -> { m.put("emoji", e1); m.put("completed", "1".equals(e2) || "true".equals(e2));
                                   m.put("rating", e3 != null ? Integer.parseInt(e3) : null); m.put("duration", e4); }
            case "curiosity"  -> { m.put("sticker", e1);   m.put("funFact1", r[4]); }
            case "readquiz"   -> { m.put("topic", e1); m.put("readingTime", e2); m.put("lesson", e3);
                                   m.put("score", e4 != null ? Integer.parseInt(e4) : null);
                                   m.put("completed", "1".equals(e5) || "true".equals(e5)); }
            case "writing"    -> { m.put("badge", e1); m.put("starWord", e2);
                                   m.put("feedbackReceived", "1".equals(e3) || "true".equals(e3)); }
            case "wordofday"  -> { m.put("emoji", e1); m.put("exampleSentence", e2); m.put("meaning", r[4]); }
            case "memorymatch"-> { m.put("theme", r[3]); }
        }
        return m;
    }
}
