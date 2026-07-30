package com.glumbi.repository;

import com.glumbi.entity.PromoCampaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromoCampaignRepository extends JpaRepository<PromoCampaign, Long> {
    Optional<PromoCampaign> findByCampaignId(String campaignId);
    boolean existsByCampaignId(String campaignId);
    List<PromoCampaign> findAllByOrderByCreatedAtDesc();

    /** Paginated list excluding MANUAL, with optional status filter. */
    @Query("SELECT c FROM PromoCampaign c WHERE c.status != 'MANUAL' " +
           "AND (:status IS NULL OR c.status = :status)")
    Page<PromoCampaign> findAllNonManual(
            @Param("status") PromoCampaign.Status status,
            Pageable pageable);

    /** Paginated — active campaigns expiring on or before a given date. */
    @Query("SELECT c FROM PromoCampaign c WHERE c.status = 'ACTIVE' AND c.expiresOn <= :cutoff")
    Page<PromoCampaign> findExpiringSoon(
            @Param("cutoff") LocalDate cutoff,
            Pageable pageable);

    /** Paginated — campaigns whose expiresOn is before today (expired). */
    @Query("SELECT c FROM PromoCampaign c WHERE c.status != 'MANUAL' AND c.expiresOn < :today")
    Page<PromoCampaign> findExpired(
            @Param("today") LocalDate today,
            Pageable pageable);
}
