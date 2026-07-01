package com.glumbi.repository;

import com.glumbi.entity.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByOwnerId(Long ownerId);
    Optional<Child> findByIdAndOwnerId(Long id, Long ownerId);
}
