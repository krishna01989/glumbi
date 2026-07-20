package com.glumbi.repository;

import com.glumbi.entity.DrawSave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DrawSaveRepository extends JpaRepository<DrawSave, Long> {
    List<DrawSave> findByChildIdOrderByUpdatedAtDesc(Long childId);
    Page<DrawSave> findByChildIdOrderByUpdatedAtDesc(Long childId, Pageable pageable);
    void deleteByChildId(Long childId);
}
