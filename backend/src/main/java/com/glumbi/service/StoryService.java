package com.glumbi.service;

import com.glumbi.agent.StoryAgent;
import com.glumbi.dto.StoryRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.Story;
import com.glumbi.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository repo;
    private final ChildService childService;
    private final StoryAgent storyAgent;

    public Story generate(StoryRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());
        int age = Period.between(child.getBirthDate(), LocalDate.now()).getYears();

        StoryAgent.StoryResult result = storyAgent.generateStory(
                child.getName(), age, child.getGender(), req.getKeywords()
        );

        Story story = new Story();
        story.setChild(child);
        story.setTitle(result.title());
        story.setContent(result.content());
        story.setKeywords(req.getKeywords());
        return repo.save(story);
    }

    public Story getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Story not found: " + id));
    }

    public List<Story> getByChild(Long childId, LocalDateTime from, LocalDateTime to) {
        if (from != null && to != null)
            return repo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, from, to);
        return repo.findByChildIdOrderByCreatedAtDesc(childId);
    }

    public List<Story> getFavorites(Long childId) {
        return repo.findByChildIdAndFavoriteTrueOrderByCreatedAtDesc(childId);
    }

    public Story toggleFavorite(Long storyId) {
        Story story = repo.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));
        story.setFavorite(!story.isFavorite());
        return repo.save(story);
    }

    public void delete(Long storyId) {
        repo.deleteById(storyId);
    }
}
