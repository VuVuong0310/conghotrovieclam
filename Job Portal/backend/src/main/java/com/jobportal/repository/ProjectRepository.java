package com.jobportal.repository;

import com.jobportal.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCandidate_Id(Long candidateId);
}
