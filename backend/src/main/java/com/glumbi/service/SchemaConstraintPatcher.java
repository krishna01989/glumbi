package com.glumbi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Patches check constraints that Hibernate's ddl-auto:update won't touch.
 * Safe to run on every startup — each patch is idempotent.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(1)
public class SchemaConstraintPatcher implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    private static final String NOTIFICATIONS_CONSTRAINT = "notifications_type_check";
    private static final String NOTIFICATIONS_ALLOWED =
        "ARRAY['PROGRESS_REPORT','MILESTONE','STORY_RECOMMENDATION','LEARNING_INSIGHT','LEARN_TO_WRITE','QUOTA_WARNING','MEMORY_PLAY']";

    @Override
    public void run(ApplicationArguments args) {
        patchNotificationsTypeConstraint();
    }

    private void patchNotificationsTypeConstraint() {
        // Check if MEMORY_PLAY is already in the constraint
        String def = jdbc.queryForObject(
            "SELECT pg_get_constraintdef(oid) FROM pg_constraint " +
            "WHERE conrelid = 'notifications'::regclass AND conname = ?",
            String.class, NOTIFICATIONS_CONSTRAINT);

        if (def != null && def.contains("MEMORY_PLAY")) return;

        // Drop old constraint and recreate with full list
        jdbc.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS " + NOTIFICATIONS_CONSTRAINT);
        jdbc.execute("ALTER TABLE notifications ADD CONSTRAINT " + NOTIFICATIONS_CONSTRAINT +
            " CHECK (type::text = ANY (" + NOTIFICATIONS_ALLOWED + "::text[]))");

        log.info("Patched {} to include MEMORY_PLAY", NOTIFICATIONS_CONSTRAINT);
    }
}
