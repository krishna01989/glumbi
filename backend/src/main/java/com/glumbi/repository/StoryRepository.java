package com.glumbi.repository;

import com.glumbi.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByChildIdOrderByCreatedAtDesc(Long childId);
    List<Story> findByChildIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long childId, LocalDateTime from, LocalDateTime to);
    List<Story> findByChildIdAndFavoriteTrueOrderByCreatedAtDesc(Long childId);
    void deleteByChildId(Long childId);
}
