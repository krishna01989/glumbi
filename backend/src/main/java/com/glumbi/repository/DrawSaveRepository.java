package com.glumbi.repository;

import com.glumbi.entity.DrawSave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DrawSaveRepository extends JpaRepository<DrawSave, Long> {
    List<DrawSave> findByChildIdOrderByUpdatedAtDesc(Long childId);
    void deleteByChildId(Long childId);
}
