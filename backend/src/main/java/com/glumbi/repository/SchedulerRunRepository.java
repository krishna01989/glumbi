package com.glumbi.repository;

import com.glumbi.entity.SchedulerRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchedulerRunRepository extends JpaRepository<SchedulerRun, Long> {
    List<SchedulerRun> findTop50BySchedulerIdOrderByStartedAtDesc(String schedulerId);
}
