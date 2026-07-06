package com.glumbi.repository;

import com.glumbi.entity.FamilyVoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FamilyVoiceRepository extends JpaRepository<FamilyVoice, Long> {
    List<FamilyVoice> findByUserIdOrderByCreatedAtAsc(Long userId);
    long countByUserId(Long userId);
    void deleteByUserId(Long userId);
}
