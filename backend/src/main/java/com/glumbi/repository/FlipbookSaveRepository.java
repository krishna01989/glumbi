package com.glumbi.repository;

import com.glumbi.entity.FlipbookSave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlipbookSaveRepository extends JpaRepository<FlipbookSave, Long> {
    List<FlipbookSave> findByChildIdOrderByUpdatedAtDesc(Long childId);
    Page<FlipbookSave> findByChildIdOrderByUpdatedAtDesc(Long childId, Pageable pageable);
    void deleteByChildId(Long childId);
}
