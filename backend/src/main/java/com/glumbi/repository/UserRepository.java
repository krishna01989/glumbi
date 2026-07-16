package com.glumbi.repository;

import com.glumbi.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByGoogleSub(String googleSub);
    boolean existsByEmail(String email);
    long countByCreatedAtAfter(LocalDateTime since);
    long countByRole(AppUser.Role role);
    List<AppUser> findTop20ByOrderByCreatedAtDesc();

    /**
     * Atomically deduct credits when within quota. Returns 1 if deducted, 0 if quota exceeded.
     * Only runs when the stored month matches — caller resets the counter first if month has rolled.
     */
    @Modifying
    @Query("UPDATE AppUser u SET u.monthlyApiCalls = u.monthlyApiCalls + :cost " +
           "WHERE u.id = :id AND u.apiCallMonth = :month " +
           "AND u.monthlyApiCalls + :cost <= :limit")
    int atomicDeductCredits(@Param("id") Long id,
                            @Param("cost") int cost,
                            @Param("month") String month,
                            @Param("limit") int limit);

    /**
     * Atomically reset the monthly counter when the stored month is stale.
     * Returns 1 if reset happened, 0 if already current (race-safe — no double reset).
     */
    @Modifying
    @Query("UPDATE AppUser u SET u.monthlyApiCalls = 0, u.apiCallMonth = :newMonth, " +
           "u.quotaWarnMonth = null, u.quotaExhaustedMonth = null " +
           "WHERE u.id = :id AND u.apiCallMonth <> :newMonth")
    int atomicResetIfStale(@Param("id") Long id, @Param("newMonth") String newMonth);
}
