package com.glumbi.repository;

import com.glumbi.entity.TorchHuntPack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface TorchHuntPackRepository extends JpaRepository<TorchHuntPack, Long> {

    Optional<TorchHuntPack> findByUserIdAndThemeKeyAndAgeGroup(Long userId, String themeKey, String ageGroup);

    @Modifying
    @Transactional
    @Query("DELETE FROM TorchHuntPack p WHERE p.userId = :userId")
    void deleteByUserId(Long userId);
}
