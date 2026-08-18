package com.glumbi.service;

import com.glumbi.agent.StoryAgent;
import com.glumbi.dto.StoryRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.Story;
import com.glumbi.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository      repo;
    private final ChildService         childService;
    private final StoryAgent           storyAgent;
    private final StoryEmbeddingService embeddingService;
    private final GlumbiMemoryService  glumbiMemory;

    public StoryGenerateResult generate(StoryRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());
        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        String category = req.getCategory() != null ? req.getCategory() : "adventure";

        StoryAgent.StoryResult result;
        Story prev = null;
        if (req.getPreviousStoryId() != null) {
            prev = repo.findById(req.getPreviousStoryId())
                    .orElseThrow(() -> new RuntimeException("Previous story not found"));
            // Inherit category from the root story so the series stays thematically consistent
            String inheritedCategory = prev.getCategory() != null ? prev.getCategory() : category;
            // Strip the "Root · " prefix so the AI doesn't mimic it in the new chapter title
            String prevTitleForAi = prev.getTitle().contains(" · ")
                    ? prev.getTitle().substring(prev.getTitle().indexOf(" · ") + 3)
                    : prev.getTitle();
            String memory = glumbiMemory.getMemoryContext(child.getId());
            result = storyAgent.continueStory(
                    child.getName(), age, child.getGender(), prevTitleForAi, prev.getContent(), inheritedCategory, memory
            );
            category = inheritedCategory;
        } else {
            String memory = glumbiMemory.getMemoryContext(child.getId());
            result = storyAgent.generateStory(
                    child.getName(), age, child.getGender(), req.getKeywords(), category, memory
            );
        }

        Story story = new Story();
        story.setChild(child);
        story.setContent(result.content());
        story.setCategory(category);
        story.setStoryPart1(result.part1());
        story.setStoryPart2A(result.part2a());
        story.setStoryPart2B(result.part2b());
        story.setGlumbiIntro(result.glumbiIntro());
        story.setGlumbiMidQuestion(result.glumbiMidQuestion());
        story.setGlumbiMidChoices(result.glumbiMidChoices());
        story.setGlumbiPostQuestion(result.glumbiPostQuestion());
        story.setGlumbiEpilogue(result.glumbiEpilogue());
        story.setVocabWordsJson(result.vocabWordsJson());
        if (prev != null) {
            story.setKeywords(prev.getKeywords());
            // Always use the root story title as prefix so chaining doesn't nest titles
            String rootTitle = prev.getTitle().contains(" · ")
                    ? prev.getTitle().substring(0, prev.getTitle().indexOf(" · "))
                    : prev.getTitle();
            story.setTitle(rootTitle + " · " + result.title());
            story.setParentStoryId(prev.getId());
            story.setSeriesId(prev.getSeriesId() != null ? prev.getSeriesId() : prev.getId());
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

    /** Returns [root, ...chapters] for any story in the series (root or chapter). */
    public List<Story> getSeries(Long id) {
        Story story = getById(id);
        Long rootId = story.getSeriesId() != null ? story.getSeriesId() : story.getId();
        Story root = rootId.equals(story.getId()) ? story : getById(rootId);
        List<Story> chapters = repo.findBySeriesId(rootId);
        List<Story> result = new java.util.ArrayList<>();
        result.add(root);
        result.addAll(chapters);
        return result;
    }

    public List<Story> getByChild(Long childId, LocalDateTime from, LocalDateTime to) {
        if (from != null && to != null)
            return repo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, from, to);
        return repo.findByChildIdOrderByCreatedAtDesc(childId);
    }

    /** Paginate root stories; embed chapters for each root so the client can group correctly. */
    public Page<Map<String, Object>> getByChildPaged(Long childId, Pageable pageable) {
        Page<Story> roots = repo.findByChildIdAndSeriesIdIsNullOrderByCreatedAtDesc(childId, pageable);
        List<Map<String, Object>> content = roots.getContent().stream().map(root -> {
            List<Story> chapters = repo.findBySeriesId(root.getId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("root", root);
            entry.put("chapters", chapters);
            return entry;
        }).toList();
        return new PageImpl<>(content, pageable, roots.getTotalElements());
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

    public Story generateRunnerLevel(Long storyId) {
        Story story = repo.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));
        Child child = story.getChild();
        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());
        StoryAgent.RunnerLevelResult result = storyAgent.generateRunnerLevel(
                story.getTitle(), story.getContent(), child.getName(), age);
        story.setRunnerLevelJson(result.runnerLevelJson());
        return repo.save(story);
    }

    @org.springframework.transaction.annotation.Transactional
    public boolean delete(Long storyId) {
        List<Story> chapters = repo.findBySeriesId(storyId);
        boolean hasSeries = !chapters.isEmpty();
        if (hasSeries) repo.deleteBySeriesId(storyId);
        repo.deleteById(storyId);
        return hasSeries;
    }
}
