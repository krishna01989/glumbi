package com.glumbi.scheduler;

import com.glumbi.agent.*;
import com.glumbi.entity.*;
import com.glumbi.entity.Notification.NotificationType;
import com.glumbi.repository.*;
import com.glumbi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final StoryRepository storyRepository;
    private final ReadQuizRepository quizRepository;
    private final WritingRepository writingRepository;
    private final NotificationService notificationService;

    private final ProgressReportAgent progressReportAgent;
    private final MilestoneAgent milestoneAgent;
    private final StoryRecommendationAgent storyRecommendationAgent;
    private final LearningInsightAgent learningInsightAgent;

    // Runs every Sunday at 8:00 AM UTC
    @Scheduled(cron = "0 0 8 * * SUN")
    public void runWeeklyNotifications() {
        LocalDateTime weekAgo     = LocalDateTime.now().minusDays(7);
        LocalDateTime twoWeeksAgo = LocalDateTime.now().minusDays(14);

        List<AppUser> users = userRepository.findAll();

        for (AppUser user : users) {
            List<Child> children = childRepository.findByOwnerId(user.getId());
            if (children.isEmpty()) continue;

            for (Child child : children) {
                try {
                    runAgentsForChild(user, child, weekAgo, twoWeeksAgo);
                } catch (Exception e) {
                    System.err.println("[Scheduler] Error for child " + child.getId() + ": " + e.getMessage());
                }
            }
        }
    }

    private void runAgentsForChild(AppUser user, Child child,
                                   LocalDateTime weekAgo, LocalDateTime twoWeeksAgo) {
        Long childId = child.getId();

        List<Story>         weekStories  = storyRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, LocalDateTime.now());
        List<ReadQuizEntry> weekQuizzes  = quizRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, LocalDateTime.now());
        List<WritingEntry>  weekWritings = writingRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, weekAgo, LocalDateTime.now());

        // Skip child if no activity this week
        if (weekStories.isEmpty() && weekQuizzes.isEmpty() && weekWritings.isEmpty()) return;

        // Agent 1: Progress Report (weekly activity summary)
        String progress = progressReportAgent.generate(child, weekStories, weekQuizzes, weekWritings);
        notificationService.save(user, child, NotificationType.PROGRESS_REPORT, progress);

        // Agent 2: Milestones (check against all-time totals)
        List<Story>         allStories  = storyRepository.findByChildIdOrderByCreatedAtDesc(childId);
        List<ReadQuizEntry> allQuizzes  = quizRepository.findByChildIdOrderByCreatedAtDesc(childId);
        List<WritingEntry>  allWritings = writingRepository.findByChildIdOrderByCreatedAtDesc(childId);

        List<String> milestones = milestoneAgent.detectAndGenerate(child, allStories, allQuizzes, allWritings);
        for (String msg : milestones) {
            notificationService.save(user, child, NotificationType.MILESTONE, msg);
        }

        // Agent 3: Story Recommendation (based on recent stories)
        String recommendation = storyRecommendationAgent.generate(child, allStories);
        notificationService.save(user, child, NotificationType.STORY_RECOMMENDATION, recommendation);

        // Agent 4: Learning Insight (bi-weekly — uses 2-week window)
        List<ReadQuizEntry> biWeeklyQuizzes  = quizRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, twoWeeksAgo, LocalDateTime.now());
        List<WritingEntry>  biWeeklyWritings = writingRepository.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, twoWeeksAgo, LocalDateTime.now());

        String insight = learningInsightAgent.generate(child, biWeeklyQuizzes, biWeeklyWritings);
        if (insight != null) {
            notificationService.save(user, child, NotificationType.LEARNING_INSIGHT, insight);
        }
    }
}
