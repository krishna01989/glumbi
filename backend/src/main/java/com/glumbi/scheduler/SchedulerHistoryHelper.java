package com.glumbi.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.entity.AppSetting;
import com.glumbi.repository.AppSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Appends run records to a capped JSON array in AppSetting so each scheduler
 * maintains a rolling history of its last MAX_HISTORY runs.
 */
public class SchedulerHistoryHelper {

    private static final Logger log = LoggerFactory.getLogger(SchedulerHistoryHelper.class);
    private static final int MAX_HISTORY = 50;

    public static void append(AppSettingRepository repo,
                              ObjectMapper mapper,
                              String historyKey,
                              Map<String, Object> record) {
        try {
            List<Map<String, Object>> history = new ArrayList<>();
            repo.findById(historyKey).ifPresent(s -> {
                try {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> existing = mapper.readValue(s.getValue(), List.class);
                    history.addAll(existing);
                } catch (Exception ignored) {}
            });

            history.add(0, record); // newest first
            if (history.size() > MAX_HISTORY) history.subList(MAX_HISTORY, history.size()).clear();

            String json = mapper.writeValueAsString(history);
            AppSetting s = repo.findById(historyKey)
                .orElseGet(() -> { AppSetting a = new AppSetting(); a.setKey(historyKey); return a; });
            s.setValue(json);
            repo.save(s);
        } catch (Exception e) {
            log.warn("Failed to save scheduler history for {}: {}", historyKey, e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> read(AppSettingRepository repo,
                                                  ObjectMapper mapper,
                                                  String historyKey) {
        return repo.findById(historyKey).map(s -> {
            try {
                return (List<Map<String, Object>>) mapper.readValue(s.getValue(), List.class);
            } catch (Exception e) {
                return new ArrayList<Map<String, Object>>();
            }
        }).orElse(new ArrayList<>());
    }
}
