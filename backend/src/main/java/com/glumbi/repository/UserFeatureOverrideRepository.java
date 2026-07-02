package com.glumbi.repository;

import com.glumbi.entity.UserFeatureOverride;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserFeatureOverrideRepository extends JpaRepository<UserFeatureOverride, UserFeatureOverride.Id> {
    List<UserFeatureOverride> findByIdUserId(Long userId);
    void deleteByIdUserId(Long userId);
}
