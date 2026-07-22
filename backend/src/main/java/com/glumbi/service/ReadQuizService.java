package com.glumbi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.glumbi.agent.ReadQuizAgent;
import com.glumbi.dto.ReadQuizRequest;
import com.glumbi.entity.Child;
import com.glumbi.entity.ReadQuizEntry;
import com.glumbi.repository.ReadQuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReadQuizService {

    private final ReadQuizRepository repo;
    private final ChildService childService;
    private final ReadQuizAgent agent;
    private final GlumbiMemoryService glumbiMemory;
    private final ObjectMapper mapper = new ObjectMapper();

    public ReadQuizEntry generate(ReadQuizRequest req) {
        Child child = childService.getByIdUnchecked(req.getChildId());
        int age = com.glumbi.service.ChildService.ageFromBirthYear(child.getBirthYear());

        String memory = glumbiMemory.getMemoryContext(child.getId());
        ReadQuizAgent.ReadQuizResult result = agent.generate(child.getName(), age, req.getTopic(), memory);

        ReadQuizEntry entry = new ReadQuizEntry();
        entry.setChild(child);
        entry.setTitle(result.title());
        entry.setStory(result.story());
        entry.setTopic(req.getTopic());
        entry.setReadingTime(result.readingTime());
        entry.setLesson(result.lesson());
        try {
            entry.setQuestionsJson(mapper.writeValueAsString(result.questions()));
        } catch (Exception e) {
            entry.setQuestionsJson("[]");
        }
        entry.setGlumbiIntro(result.glumbiIntro());
        entry.setGlumbiScoreComment(result.glumbiScoreComment());
        return repo.save(entry);
    }

    public ReadQuizEntry submit(Long entryId, int[] answers) {
        ReadQuizEntry entry = repo.findById(entryId)
            .orElseThrow(() -> new RuntimeException("Quiz not found"));

        try {
            ReadQuizAgent.Question[] questions =
                mapper.readValue(entry.getQuestionsJson(), ReadQuizAgent.Question[].class);

            int score = 0;
            for (int i = 0; i < Math.min(answers.length, questions.length); i++) {
                if (answers[i] == questions[i].correctIndex()) score++;
            }
            entry.setAnswersJson(mapper.writeValueAsString(answers));
            entry.setScore(score);
            entry.setCompleted(true);
        } catch (Exception e) {
            entry.setScore(0);
            entry.setCompleted(true);
        }
        return repo.save(entry);
    }

    public List<ReadQuizEntry> getByChild(Long childId, LocalDateTime from, LocalDateTime to) {
        if (from != null && to != null)
            return repo.findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(childId, from, to);
        return repo.findByChildIdOrderByCreatedAtDesc(childId);
    }

    public Page<ReadQuizEntry> getByChildPaged(Long childId, Pageable pageable) {
        return repo.findByChildIdOrderByCreatedAtDesc(childId, pageable);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
