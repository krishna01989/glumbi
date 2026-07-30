package com.glumbi.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.agent.*;
import com.glumbi.entity.*;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.repository.*;
import com.glumbi.service.AdminAlertService;
import com.glumbi.service.ApiQuotaService;
import com.glumbi.service.EmailTemplates;
import com.glumbi.service.NotificationService;
import com.glumbi.service.ResendClient;
import java.time.YearMonth;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    public static final String SCHEDULER_ID    = "weekly-notifications";
    public static final String AGENT_PREFIX    = "agent.";
    public static final String LAST_RUN_KEY    = "scheduler.weekly-notifications.last-run";
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Agent IDs — used as AppSetting keys: agent.<id>.enabled
    public static final String AGENT_PROGRESS    = "progress-report";
    public static final String AGENT_MILESTONE   = "milestone";
    public static final String AGENT_STORY_REC   = "story-recommendation";
    public static final String AGENT_LEARNING    = "learning-insight";
    public static final String AGENT_LEARN_WRITE = "learn-to-write";
    public static final String AGENT_MEMORY      = "memory-play";
    public static final String AGENT_CURIOSITY    = "curiosity-insight";
    public static final String AGENT_JOURNAL      = "journal-insight";
    public static final String AGENT_WEEKLY_EMAIL = "weekly-recap-email";

    private final UserRepository           userRepository;
    private final ChildRepository          childRepository;
    private final StoryRepository          storyRepository;
    private final ReadQuizRepository       quizRepository;
    private final WritingRepository        writingRepository;
    private final ActivityRepository       activityRepository;
    private final CuriosityRepository      curiosityRepository;
    private final JournalRepository        journalRepository;
    private final NotificationService      notificationService;
    private final AppSettingRepository     appSettingRepo;
    private final SchedulerRunRepository   schedulerRunRepo;

    private final ProgressReportAgent      progressReportAgent;
    private final MilestoneAgent           milestoneAgent;
    private final StoryRecommendationAgent storyRecommendationAgent;
    private final LearningInsightAgent     learningInsightAgent;
    private final LearnToWriteAgent        learnToWriteAgent;
    private final MemoryPlayAgent          memoryPlayAgent;
    private final CuriosityInsightAgent    curiosityInsightAgent;
    private final JournalInsightAgent      journalInsightAgent;

    private final FlashcardSetRepository          flashcardSetRepo;
    private final WordOfDayRepository             wordOfDayRepo;
    private final MemoryMatchRepository           memoryMatchRepo;
    private final ChildActivityEventRepository    activityEventRepo;
    private final ResendClient             resendClient;
    private final EmailTemplates           emailTemplates;
    private final AdminAlertService        adminAlertService;
    private final ApiQuotaService          quotaService;

    private final ObjectMapper objectMapper;

    public boolean isAgentEnabled(String agentId) {
        return appSettingRepo.findById(AGENT_PREFIX + agentId + ".enabled")
            .map(s -> !"false".equalsIgnoreCase(s.getValue()))
            .orElse(true);
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
        SchedulerRun run = new SchedulerRun();
        run.setSchedulerId(SCHEDULER_ID);
        run.setStartedAt(LocalDateTime.now(ZoneOffset.UTC));
        run.setStatus("RUNNING");
        run = schedulerRunRepo.save(run);

        List<String> ran     = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        List<String> errors  = new ArrayList<>();

        boolean runProgress    = isAgentEnabled(AGENT_PROGRESS);
        boolean runMilestone   = isAgentEnabled(AGENT_MILESTONE);
        boolean runStoryRec    = isAgentEnabled(AGENT_STORY_REC);
        boolean runLearning    = isAgentEnabled(AGENT_LEARNING);
        boolean runLearnWrite  = isAgentEnabled(AGENT_LEARN_WRITE);
        boolean runMemory      = isAgentEnabled(AGENT_MEMORY);
        boolean runCuriosity   = isAgentEnabled(AGENT_CURIOSITY);
        boolean runJournal     = isAgentEnabled(AGENT_JOURNAL);
        boolean runWeeklyEmail = isAgentEnabled(AGENT_WEEKLY_EMAIL);

        if (!runProgress)    { skipped.add("Progress Report");      log.info("SKIP Progress Report — disabled by admin"); }
        if (!runMilestone)   { skipped.add("Milestone");            log.info("SKIP Milestone — disabled by admin"); }
        if (!runStoryRec)    { skipped.add("Story Recommendation"); log.info("SKIP Story Recommendation — disabled by admin"); }
        if (!runLearning)    { skipped.add("Learning Insight");     log.info("SKIP Learning Insight — disabled by admin"); }
        if (!runLearnWrite)  { skipped.add("Learn to Write");       log.info("SKIP Learn to Write — disabled by admin"); }
        if (!runMemory)      { skipped.add("Memory Play");          log.info("SKIP Memory Play — disabled by admin"); }
        if (!runCuriosity)   { skipped.add("Curiosity Insight");    log.info("SKIP Curiosity Insight — disabled by admin"); }
        if (!runJournal)     { skipped.add("Journal Insight");      log.info("SKIP Journal Insight — disabled by admin"); }
        if (!runWeeklyEmail) { skipped.add("Weekly Recap Email");   log.info("SKIP Weekly Recap Email — disabled by admin"); }

        LocalDateTime weekAgo     = LocalDateTime.now(ZoneOffset.UTC).minusDays(7);
        LocalDateTime twoWeeksAgo = LocalDateTime.now(ZoneOffset.UTC).minusDays(14);
        int childrenProcessed = 0;

        try {
            List<AppUser> users = userRepository.findAll();
            for (AppUser user : users) {
                if (user.isAdminOrAbove()) continue;
                List<Child> children = childRepository.findByOwnerId(user.getId());
                if (children.isEmpty()) {
                    if (runWeeklyEmail && user.isMarketingEmailsEnabled()) {
                        resendClient.send(
                            user.getEmail(),
                            "👋 Your Glumbi adventure hasn't started yet",
                            emailTemplates.noChildAdded()
                        );
                    }
                    continue;
                }

                for (Child child : children.stream().filter(c -> !c.isGraduated()).toList()) {
                    try {
                        boolean processed = runAgentsForChild(
                            user, child, weekAgo, twoWeeksAgo,
                            runProgress, runMilestone, runStoryRec, runLearning,
                            runLearnWrite, runMemory, runCuriosity, runJournal,
                            runWeeklyEmail
                        );
                        if (processed) childrenProcessed++;
                    } catch (Exception e) {
                        String err = "Child " + child.getId() + " (" + child.getName() + "): " + e.getMessage();
                        errors.add(err);
                        log.error("Child {}: {}", child.getId(), e.getMessage());
                    }
                }
            }

            pushWeeklyStatsAlerts(weekAgo);

            if (runProgress)    ran.add("Progress Report");
            if (runMilestone)   ran.add("Milestone");
            if (runStoryRec)    ran.add("Story Recommendation");
            if (runLearning)    ran.add("Learning Insight");
            if (runLearnWrite)  ran.add("Learn to Write");
            if (runMemory)      ran.add("Memory Play");
            if (runCuriosity)   ran.add("Curiosity Insight");
            if (runJournal)     ran.add("Journal Insight");
            if (runWeeklyEmail) ran.add("Weekly Recap Email");

        } catch (Exception e) {
            errors.add("Fatal: " + e.getMessage());
            log.error("Weekly scheduler fatal error: {}", e.getMessage());
        }

        run.setFinishedAt(LocalDateTime.now(ZoneOffset.UTC));
        run.setStatus(errors.isEmpty() ? "SUCCESS" : "FAILED");
        run.setChildrenProcessed(childrenProcessed);
        run.setAgentsRan(toJson(ran));
        run.setAgentsSkipped(toJson(skipped));
        run.setErrors(toJson(errors));
        schedulerRunRepo.save(run);

        saveLastRunAppSetting(run);

        log.info("Weekly notifications done — ran: {}, skipped: {}, errors: {}", ran, skipped, errors.size());
    }

    private boolean runAgentsForChild(AppUser user, Child child,
                                      LocalDateTime weekAgo, LocalDateTime twoWeeksAgo,
                                      boolean runProgress, boolean runMilestone,
                                      boolean runStoryRec, boolean runLearning,
                                      boolean runLearnWrite, boolean runMemory,
                                      boolean runCuriosity, boolean runJournal,
                                      boolean runWeeklyEmail) {
        Long childId = child.getId();
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        List<Story>          weekStories     = storyRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, now);
        List<ReadQuizEntry>  weekQuizzes     = quizRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, now);
        List<WritingEntry>   weekWritings    = writingRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, now);
        List<Activity>       weekLearn       = activityRepository.findByChildIdAndCategoryAndCreatedAtBetweenOrderByCreatedAtDesc(childId, "learn", weekAgo, now);
        List<CuriosityEntry> weekCuriosities = curiosityRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, now);
        List<JournalEntry>   weekJournals    = journalRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, now);

        int flashcardSets    = flashcardSetRepo.findByChildIdAndCreatedAtBetween(childId, weekAgo, now).size();
        long wordsLearned    = wordOfDayRepo.countByChildIdAndDateBetween(childId, weekAgo.toLocalDate(), LocalDate.now());
        long matchGames      = memoryMatchRepo.countByChildIdAndCreatedAtBetween(childId, weekAgo, now);
        long riddleSessions  = activityEventRepo.countByChildFeatureEventType(childId, "riddle", "session", weekAgo);
        long glumbiRiddle    = activityEventRepo.countByChildFeatureEventType(childId, "riddle", "glumbi_riddle", weekAgo);
        long glumbiStory     = activityEventRepo.countByChildFeatureEventType(childId, "story", "glumbi_mid_choice", weekAgo);
        long glumbiCuriosity = activityEventRepo.countByChildFeatureEventType(childId, "curiosity", "glumbi_followup_choice", weekAgo);
        int totalGlumbi      = (int)(glumbiRiddle + glumbiStory + glumbiCuriosity);

        // Skip child if there was no activity at all this week
        boolean anyActivity = !weekStories.isEmpty() || !weekQuizzes.isEmpty()
                || !weekWritings.isEmpty() || !weekLearn.isEmpty()
                || !weekCuriosities.isEmpty() || !weekJournals.isEmpty()
                || riddleSessions > 0;
        if (!anyActivity) {
            if (runWeeklyEmail && user.isMarketingEmailsEnabled()) {
                resendClient.send(
                    user.getEmail(),
                    "A quiet week for " + child.getName() + " 😴",
                    emailTemplates.quietWeek(child.getName())
                );
            }
            return false;
        }

        List<Story>         allStories  = null;
        List<ReadQuizEntry> allQuizzes  = null;
        List<WritingEntry>  allWritings = null;

        String progressText = null;
        if (runProgress || runWeeklyEmail) {
            progressText = progressReportAgent.generate(
                child, weekStories, weekQuizzes, weekWritings,
                weekCuriosities, weekJournals,
                flashcardSets, (int) wordsLearned, (int) matchGames, (int) riddleSessions, totalGlumbi);
            if (runProgress) {
                notificationService.save(user, child, NotificationType.PROGRESS_REPORT, progressText);
            }
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
            List<ReadQuizEntry> biWeeklyQuizzes  = quizRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, twoWeeksAgo, now);
            List<WritingEntry>  biWeeklyWritings = writingRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, twoWeeksAgo, now);
            String insight = learningInsightAgent.generate(child, biWeeklyQuizzes, biWeeklyWritings);
            if (insight != null) notificationService.save(user, child, NotificationType.LEARNING_INSIGHT, insight);
        }

        if (runLearnWrite) {
            String learnMsg = learnToWriteAgent.generate(child, weekLearn);
            if (learnMsg != null) notificationService.save(user, child, NotificationType.LEARN_TO_WRITE, learnMsg);
        }

        if (runMemory) {
            String memMsg = memoryPlayAgent.generateWeeklyInsight(
                child.getName(),
                com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear()),
                flashcardSets, (int) wordsLearned, (int) matchGames);
            if (memMsg != null) notificationService.save(user, child, NotificationType.MEMORY_PLAY, memMsg);
        }

        if (runCuriosity && !weekCuriosities.isEmpty()) {
            String curiosityMsg = curiosityInsightAgent.generate(child, weekCuriosities);
            if (curiosityMsg != null) notificationService.save(user, child, NotificationType.CURIOSITY_INSIGHT, curiosityMsg);
        }

        if (runJournal && !weekJournals.isEmpty()) {
            String journalMsg = journalInsightAgent.generate(child, weekJournals);
            if (journalMsg != null) notificationService.save(user, child, NotificationType.JOURNAL_INSIGHT, journalMsg);
        }

        // Weekly recap email — reuses progress report text, zero extra Claude call
        if (runWeeklyEmail && progressText != null && user.isMarketingEmailsEnabled()) {
            resendClient.send(
                user.getEmail(),
                "🌟 " + child.getName() + "'s week on Glumbi",
                emailTemplates.weeklyRecap(child.getName(), progressText)
            );
        }

        return true;
    }

    private void pushWeeklyStatsAlerts(LocalDateTime weekAgo) {
        try {
            String thisMonth = YearMonth.now().toString();
            int defaultLimit = quotaService.getDefaultMonthlyCredits();

            long newUsersThisWeek  = userRepository.countByRoleAndCreatedAtAfter(AppUser.Role.USER, weekAgo);
            long usersNoChildren   = userRepository.countUsersWithNoChildren();
            long usersAtLimit      = userRepository.countUsersAtQuotaLimit(thisMonth, defaultLimit);
            long usersNearLimit    = userRepository.countUsersNearQuotaLimit(thisMonth, defaultLimit);

            if (newUsersThisWeek == 0)
                adminAlertService.notifyStatsAlert("ℹ️ No new users signed up this week", "info");
            if (newUsersThisWeek >= 5)
                adminAlertService.notifyStatsAlert("🎉 " + newUsersThisWeek + " new users joined this week!", "success");
            if (usersNoChildren > 0)
                adminAlertService.notifyStatsAlert("⚠️ " + usersNoChildren + " user(s) signed up but haven't added a child yet", "warn");
            if (usersAtLimit > 0)
                adminAlertService.notifyStatsAlert("🚫 " + usersAtLimit + " user(s) have exhausted their monthly AI credits", "warn");
            if (usersNearLimit > 0)
                adminAlertService.notifyStatsAlert("⚠️ " + usersNearLimit + " user(s) are at 80%+ of their monthly AI credits", "warn");
        } catch (Exception e) {
            log.warn("pushWeeklyStatsAlerts failed: {}", e.getMessage());
        }
    }

    private void saveLastRunAppSetting(SchedulerRun run) {
        try {
            Map<String, Object> log = new LinkedHashMap<>();
            log.put("startedAt",         run.getStartedAt().format(FMT));
            log.put("finishedAt",        run.getFinishedAt() != null ? run.getFinishedAt().format(FMT) : null);
            log.put("status",            run.getStatus());
            log.put("childrenProcessed", run.getChildrenProcessed());
            log.put("agentsRan",         fromJson(run.getAgentsRan()));
            log.put("agentsSkipped",     fromJson(run.getAgentsSkipped()));
            log.put("errors",            fromJson(run.getErrors()));
            log.put("success",           "SUCCESS".equals(run.getStatus()));

            String json = objectMapper.writeValueAsString(log);
            AppSetting s = appSettingRepo.findById(LAST_RUN_KEY)
                .orElseGet(() -> { AppSetting a = new AppSetting(); a.setKey(LAST_RUN_KEY); return a; });
            s.setValue(json);
            appSettingRepo.save(s);
        } catch (Exception e) {
            log.warn("Failed to save last-run AppSetting: {}", e.getMessage());
        }
    }

    private String toJson(List<String> list) {
        try { return objectMapper.writeValueAsString(list); } catch (Exception e) { return "[]"; }
    }

    private List<?> fromJson(String json) {
        if (json == null) return List.of();
        try { return objectMapper.readValue(json, List.class); } catch (Exception e) { return List.of(); }
    }
}
