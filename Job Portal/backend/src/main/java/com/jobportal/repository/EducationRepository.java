package com.jobportal.repository;

import com.jobportal.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByCandidate_Id(Long candidateId);
}
