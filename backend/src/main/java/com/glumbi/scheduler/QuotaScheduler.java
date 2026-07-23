package com.glumbi.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.entity.AppSetting;
import com.glumbi.entity.AppUser;
import com.glumbi.entity.SchedulerRun;
import com.glumbi.repository.AppSettingRepository;
import com.glumbi.repository.SchedulerRunRepository;
import com.glumbi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuotaScheduler {

    public static final String LAST_RUN_KEY    = "scheduler.reset-credits.last-run";
    public static final String HISTORY_KEY  = "scheduler.reset-credits.history";

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final UserRepository userRepository;
    private final SchedulerRunRepository schedulerRunRepo;
    private final AppSettingRepository appSettingRepo;
    private final ObjectMapper objectMapper;

    @Scheduled(cron = "0 0 0 1 * *")
    @Transactional
    public void resetAllMonthlyCounters() {
        SchedulerRun run = new SchedulerRun();
        run.setSchedulerId("reset-credits");
        run.setStartedAt(LocalDateTime.now(ZoneOffset.UTC));
        run.setStatus("RUNNING");
        run = schedulerRunRepo.save(run);

        String error = null;
        int usersReset = 0;
        try {
            String thisMonth = YearMonth.now().toString();
            for (AppUser user : userRepository.findAll()) {
                if (user.isAdminOrAbove()) continue;
                if (thisMonth.equals(user.getLastResetMonth())) continue; // already reset this month
                user.setMonthlyApiCalls(0);
                user.setApiCallMonth(thisMonth);
                user.setQuotaWarnMonth(null);
                user.setQuotaExhaustedMonth(null);
                user.setLastResetMonth(thisMonth);
                userRepository.save(user);
                usersReset++;
            }
        } catch (Exception e) {
            error = e.getMessage();
            log.error("Credit reset failed: {}", error);
        }

        run.setFinishedAt(LocalDateTime.now(ZoneOffset.UTC));
        run.setStatus(error == null ? "SUCCESS" : "FAILED");
        run.setChildrenProcessed(usersReset);
        run.setErrors(error != null ? "[\"" + error + "\"]" : "[]");
        schedulerRunRepo.save(run);
        saveLastRunAppSetting(run);
    }

    private void saveLastRunAppSetting(SchedulerRun run) {
        try {
            Map<String, Object> log = new LinkedHashMap<>();
            log.put("startedAt",         run.getStartedAt().format(FMT));
            log.put("finishedAt",        run.getFinishedAt() != null ? run.getFinishedAt().format(FMT) : null);
            log.put("status",            run.getStatus());
            log.put("childrenProcessed", run.getChildrenProcessed());
            log.put("errors",            run.getErrors());
            log.put("success",           "SUCCESS".equals(run.getStatus()));

            String json = objectMapper.writeValueAsString(log);
            AppSetting s = appSettingRepo.findById(LAST_RUN_KEY)
                    .orElseGet(() -> { AppSetting a = new AppSetting(); a.setKey(LAST_RUN_KEY); return a; });
            s.setValue(json);
            appSettingRepo.save(s);
            SchedulerHistoryHelper.append(appSettingRepo, objectMapper, HISTORY_KEY, log);
        } catch (Exception e) {
            log.warn("Failed to save last-run AppSetting: {}", e.getMessage());
        }
    }
}
