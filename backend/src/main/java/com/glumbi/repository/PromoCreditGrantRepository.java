package com.glumbi.repository;

import com.glumbi.entity.PromoCreditGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromoCreditGrantRepository extends JpaRepository<PromoCreditGrant, Long> {

    /** Active grants for a user, ordered earliest-expiry-first for EEF draw. */
    @Query("SELECT g FROM PromoCreditGrant g WHERE g.user.id = :uid " +
           "AND g.expiresOn >= :today AND g.usedCredits < g.totalCredits " +
           "ORDER BY g.expiresOn ASC, g.grantedAt ASC")
    List<PromoCreditGrant> findActiveForUser(@Param("uid") Long uid, @Param("today") LocalDate today);

    /** All grants for a user (active + expired + exhausted), newest first. */
    @Query("SELECT g FROM PromoCreditGrant g WHERE g.user.id = :uid ORDER BY g.grantedAt DESC")
    List<PromoCreditGrant> findAllForUser(@Param("uid") Long uid);

    /** Check if a grant already exists for this user+campaign (dedup). */
    boolean existsByUserIdAndCampaignCampaignId(Long userId, String campaignId);

    Optional<PromoCreditGrant> findByUserIdAndCampaignCampaignId(Long userId, String campaignId);

    /** All grants for a campaign (admin view). */
    @Query("SELECT g FROM PromoCreditGrant g WHERE g.campaign.campaignId = :campaignId ORDER BY g.grantedAt DESC")
    List<PromoCreditGrant> findByCampaignId(@Param("campaignId") String campaignId);

    /** Aggregate stats per campaign — for admin campaign list. */
    @Query("SELECT g.campaign.campaignId, g.label, MIN(g.grantedAt), MAX(g.expiresOn), " +
           "COUNT(g), SUM(g.totalCredits), SUM(g.usedCredits) " +
           "FROM PromoCreditGrant g GROUP BY g.campaign.campaignId, g.label ORDER BY MIN(g.grantedAt) DESC")
    List<Object[]> findCampaignSummaries();

    /**
     * Atomically draw credits from a single grant.
     * Returns 1 if drawn, 0 if grant is exhausted or expired.
     */
    @Modifying
    @Query("UPDATE PromoCreditGrant g SET g.usedCredits = g.usedCredits + :cost " +
           "WHERE g.id = :id AND g.usedCredits + :cost <= g.totalCredits AND g.expiresOn >= :today")
    int atomicDraw(@Param("id") Long id, @Param("cost") int cost, @Param("today") LocalDate today);
}
