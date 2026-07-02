package com.glumbi.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.agent.*;
import com.glumbi.entity.*;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.repository.*;
import com.glumbi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    public static final String AGENT_PREFIX      = "agent.";
    public static final String LAST_RUN_KEY      = "scheduler.weekly-notifications.last-run";
    public static final String HISTORY_KEY       = "scheduler.weekly-notifications.history";
    private static final DateTimeFormatter FMT   = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Agent IDs — used as AppSetting keys: agent.<id>.enabled
    public static final String AGENT_PROGRESS    = "progress-report";
    public static final String AGENT_MILESTONE   = "milestone";
    public static final String AGENT_STORY_REC   = "story-recommendation";
    public static final String AGENT_LEARNING    = "learning-insight";

    private final UserRepository           userRepository;
    private final ChildRepository          childRepository;
    private final StoryRepository          storyRepository;
    private final ReadQuizRepository       quizRepository;
    private final WritingRepository        writingRepository;
    private final NotificationService      notificationService;
    private final AppSettingRepository     appSettingRepo;

    private final ProgressReportAgent      progressReportAgent;
    private final MilestoneAgent           milestoneAgent;
    private final StoryRecommendationAgent storyRecommendationAgent;
    private final LearningInsightAgent     learningInsightAgent;

    private final ObjectMapper objectMapper;

    public boolean isAgentEnabled(String agentId) {
        return appSettingRepo.findById(AGENT_PREFIX + agentId + ".enabled")
            .map(s -> !"false".equalsIgnoreCase(s.getValue()))
            .orElse(true); // default on
    }

    public void setAgentEnabled(String agentId, boolean enabled) {
        AppSetting s = appSettingRepo.findById(AGENT_PREFIX + agentId + ".enabled")
            .orElseGet(() -> { AppSetting a = new AppSetting(); a.setKey(AGENT_PREFIX + agentId + ".enabled"); return a; });
        s.setValue(String.valueOf(enabled));
        appSettingRepo.save(s);
    }

    // Runs every Sunday at 8:00 AM UTC
    @Scheduled(cron = "0 0 8 * * SUN")
    public void runWeeklyNotifications() {
        String startedAt = LocalDateTime.now().format(FMT);
        List<String> ran     = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> errors  = new ArrayList<>();

        boolean runProgress = isAgentEnabled(AGENT_PROGRESS);
        boolean runMilestone = isAgentEnabled(AGENT_MILESTONE);
        boolean runStoryRec  = isAgentEnabled(AGENT_STORY_REC);
        boolean runLearning  = isAgentEnabled(AGENT_LEARNING);

        if (!runProgress)  { skipped.add("Progress Report"); System.out.println("[Scheduler] SKIP Progress Report — disabled by admin"); }
        if (!runMilestone) { skipped.add("Milestone");       System.out.println("[Scheduler] SKIP Milestone — disabled by admin"); }
        if (!runStoryRec)  { skipped.add("Story Recommendation"); System.out.println("[Scheduler] SKIP Story Recommendation — disabled by admin"); }
        if (!runLearning)  { skipped.add("Learning Insight"); System.out.println("[Scheduler] SKIP Learning Insight — disabled by admin"); }

        LocalDateTime weekAgo     = LocalDateTime.now().minusDays(7);
        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusDays(14);

        List<AppUser> users = userRepository.findAll();
        int childrenProcessed = 0;

        for (AppUser user : users) {
            List<Child> children = childRepository.findByOwnerId(user.getId());
            if (children.isEmpty()) continue;

            for (Child child : children) {
                try {
                    boolean processed = runAgentsForChild(
                        user, child, weekAgo, twoWeeksAgo,
                        runProgress, runMilestone, runStoryRec, runLearning
                    );
                    if (processed) childrenProcessed++;
                } catch (Exception e) {
                    String err = "Child " + child.getId() + ": " + e.getMessage();
                    errors.add(err);
                    System.err.println("[Scheduler] ERROR " + err);
                }
            }
        }

        if (runProgress)  ran.add("Progress Report");
        if (runMilestone) ran.add("Milestone");
        if (runStoryRec)  ran.add("Story Recommendation");
        if (runLearning)  ran.add("Learning Insight");

        String finishedAt = LocalDateTime.now().format(FMT);
        saveLastRunLog(startedAt, finishedAt, ran, skipped, errors, childrenProcessed);
        System.out.println("[Scheduler] Weekly notifications done. Ran: " + ran + " Skipped: " + skipped + " Errors: " + errors.size());
    }

    private boolean runAgentsForChild(AppUser user, Child child,
                                      LocalDateTime weekAgo, LocalDateTime twoWeeksAgo,
                                      boolean runProgress, boolean runMilestone,
                                      boolean runStoryRec, boolean runLearning) {
        Long childId = child.getId();

        List<Story>         weekStories  = storyRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, LocalDateTime.now());
        List<ReadQuizEntry> weekQuizzes  = quizRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, LocalDateTime.now());
        List<WritingEntry>  weekWritings = writingRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, LocalDateTime.now());

        if (weekStories.isEmpty() && weekQuizzes.isEmpty() && weekWritings.isEmpty()) return false;

        List<Story>         allStories  = null;
        List<ReadQuizEntry> allQuizzes  = null;
        List<WritingEntry>  allWritings = null;

        if (runProgress) {
            String progress = progressReportAgent.generate(child, weekStories, weekQuizzes, weekWritings);
            notificationService.save(user, child, NotificationType.PROGRESS_REPORT, progress);
        }

        if (runMilestone) {
            allStories  = storyRepository.findByChildIdOrderByCreatedAtDesc(childId);
            allQuizzes  = quizRepository.findByChildIdOrderByCreatedAtDesc(childId);
            allWritings = writingRepository.findByChildIdOrderByCreatedAtDesc(childId);
            List<String> milestones = milestoneAgent.detectAndGenerate(child, allStories, allQuizzes, allWritings);
            for (String msg : milestones) {
                notificationService.save(user, child, NotificationType.MILESTONE, msg);
            }
        }

        if (runStoryRec) {
            if (allStories == null) allStories = storyRepository.findByChildIdOrderByCreatedAtDesc(childId);
            String recommendation = storyRecommendationAgent.generate(child, allStories);
            notificationService.save(user, child, NotificationType.STORY_RECOMMENDATION, recommendation);
        }

        if (runLearning) {
            List<ReadQuizEntry> biWeeklyQuizzes  = quizRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, twoWeeksAgo, LocalDateTime.now());
            List<WritingEntry>  biWeeklyWritings = writingRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, twoWeeksAgo, LocalDateTime.now());
            String insight = learningInsightAgent.generate(child, biWeeklyQuizzes, biWeeklyWritings);
            if (insight != null) {
                notificationService.save(user, child, NotificationType.LEARNING_INSIGHT, insight);
            }
        }

        return true;
    }

    private void saveLastRunLog(String startedAt, String finishedAt,
                                List<String> ran, List<String> skipped,
                                List<String> errors, int childrenProcessed) {
        try {
            Map<String, Object> log = new LinkedHashMap<>();
            log.put("startedAt", startedAt);
            log.put("finishedAt", finishedAt);
            log.put("childrenProcessed", childrenProcessed);
            log.put("agentsRan", ran);
            log.put("agentsSkipped", skipped);
            log.put("errors", errors);
            log.put("success", errors.isEmpty());

            // Overwrite last-run (used by scheduler status card)
            String json = objectMapper.writeValueAsString(log);
            AppSetting s = appSettingRepo.findById(LAST_RUN_KEY)
                .orElseGet(() -> { AppSetting a = new AppSetting(); a.setKey(LAST_RUN_KEY); return a; });
            s.setValue(json);
            appSettingRepo.save(s);

            // Append to rolling history
            SchedulerHistoryHelper.append(appSettingRepo, objectMapper, HISTORY_KEY, log);
        } catch (Exception e) {
            System.err.println("[Scheduler] Failed to save last-run log: " + e.getMessage());
        }
    }
}
