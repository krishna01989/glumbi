package com.glumbi.repository;

import com.glumbi.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByOwnerId(Long ownerId);
    Optional<Child> findByIdAndOwnerId(Long id, Long ownerId);
    long countByCreatedAtAfter(LocalDateTime since);

    @Query("SELECT c.owner.id FROM Child c GROUP BY c.owner.id")
    List<Long> findOwnerIdsWithChildren();
}
