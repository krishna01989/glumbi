package com.glumbi.service;

import com.glumbi.agent.ActivityAgent;
import com.glumbi.dto.ActivityRequest;
import com.glumbi.dto.RatingRequest;
import com.glumbi.entity.Activity;
import com.glumbi.entity.Child;
import com.glumbi.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository repo;
    private final ChildService childService;
    private final ActivityAgent agent;

    public List<Activity> generate(ActivityRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());
        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        // Build context from past highly-rated activities so agent personalises
        String pastFavorites = repo.findByChildIdAndCompletedTrueOrderByCreatedAtDesc(child.getId())
                .stream()
                .filter(a -> a.getRating() != null && a.getRating() >= 4)
                .limit(5)
                .map(Activity::getTitle)
                .collect(Collectors.joining(", "));

        List<ActivityAgent.ActivityResult> results = agent.generateActivities(
                child.getName(), age,
                req.getTimeOfDay() != null ? req.getTimeOfDay() : "anytime",
                req.getWeather()    != null ? req.getWeather()    : "sunny",
                pastFavorites,
                req.getCount() > 0 ? req.getCount() : 3
        );

        return results.stream().map(r -> {
            Activity a = new Activity();
            a.setChild(child);
            a.setTitle(r.title());
            a.setDescription(r.description());
            a.setCategory(r.category());
            a.setDuration(r.duration());
            a.setEmoji(r.emoji());
            return repo.save(a);
        }).collect(Collectors.toList());
    }

    public List<Activity> getByChild(Long childId, LocalDateTime from, LocalDateTime to, boolean includeLearn) {
        if (includeLearn) {
            if (from != null && to != null)
                return repo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, from, to);
            return repo.findByChildIdOrderByCreatedAtDesc(childId);
        }
        if (from != null && to != null)
            return repo.findByChildIdAndCategoryNotAndCreatedAtBetweenOrderByCreatedAtDesc(childId, "learn", from, to);
        return repo.findByChildIdAndCategoryNotOrderByCreatedAtDesc(childId, "learn");
    }

    public Activity markComplete(Long id, RatingRequest req) {
        Activity a = repo.findById(id).orElseThrow(() -> new RuntimeException("Activity not found: " + id));
        a.setCompleted(true);
        if (req.getRating() != null) a.setRating(req.getRating());
        return repo.save(a);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    @Transactional
    public void deletePendingByChild(Long childId) {
        repo.deleteByChildIdAndCompletedFalse(childId);
    }
}
