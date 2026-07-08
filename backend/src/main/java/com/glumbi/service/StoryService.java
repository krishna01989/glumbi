package com.glumbi.service;

import com.glumbi.agent.StoryAgent;
import com.glumbi.dto.StoryRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.Story;
import com.glumbi.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository      repo;
    private final ChildService         childService;
    private final StoryAgent           storyAgent;
    private final StoryEmbeddingService embeddingService;

    public StoryGenerateResult generate(StoryRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());
        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        StoryAgent.StoryResult result;
        Story prev = null;
        if (req.getPreviousStoryId() != null) {
            prev = repo.findById(req.getPreviousStoryId())
                    .orElseThrow(() -> new RuntimeException("Previous story not found"));
            // Strip the "Root · " prefix so the AI doesn't mimic it in the new chapter title
            String prevTitleForAi = prev.getTitle().contains(" · ")
                    ? prev.getTitle().substring(prev.getTitle().indexOf(" · ") + 3)
                    : prev.getTitle();
            result = storyAgent.continueStory(
                    child.getName(), age, child.getGender(), prevTitleForAi, prev.getContent()
            );
        } else {
            result = storyAgent.generateStory(
                    child.getName(), age, child.getGender(), req.getKeywords()
            );
        }

        Story story = new Story();
        story.setChild(child);
        story.setContent(result.content());
        if (prev != null) {
            story.setKeywords(prev.getKeywords());
            // Always use the root story title as prefix so chaining doesn't nest titles
            String rootTitle = prev.getTitle().contains(" · ")
                    ? prev.getTitle().substring(0, prev.getTitle().indexOf(" · "))
                    : prev.getTitle();
            story.setTitle(rootTitle + " · " + result.title());
        } else {
            story.setTitle(result.title());
            story.setKeywords(req.getKeywords());
        }
        Story saved = repo.save(story);

        // Embed synchronously first so this story is immediately searchable,
        // then find similar — both use the same keywords as the query vector
        embeddingService.embedAndSave(saved);
        List<Story> similar = embeddingService.findSimilarById(saved.getId(), child.getId());

        return new StoryGenerateResult(saved, similar);
    }

    public List<Story> findSimilar(Long storyId) {
        Story story = repo.findById(storyId).orElseThrow(() -> new RuntimeException("Story not found: " + storyId));
        return embeddingService.findSimilarById(storyId, story.getChild().getId());
    }

    public record StoryGenerateResult(Story story, List<Story> similar) {}


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
