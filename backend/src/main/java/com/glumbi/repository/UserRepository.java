package com.glumbi.repository;

import com.glumbi.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByGoogleSub(String googleSub);
    boolean existsByEmail(String email);
    long countByCreatedAtAfter(LocalDateTime since);
    List<AppUser> findTop20ByOrderByCreatedAtDesc();
}
