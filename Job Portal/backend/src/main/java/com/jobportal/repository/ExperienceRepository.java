package com.jobportal.repository;

import com.jobportal.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByCandidate_Id(Long candidateId);
}
