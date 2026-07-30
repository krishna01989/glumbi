package com.glumbi.repository;

import com.glumbi.entity.PromoCampaign;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PromoCampaignRepository extends JpaRepository<PromoCampaign, Long> {
    Optional<PromoCampaign> findByCampaignId(String campaignId);
    boolean existsByCampaignId(String campaignId);
    List<PromoCampaign> findAllByOrderByCreatedAtDesc();
}
