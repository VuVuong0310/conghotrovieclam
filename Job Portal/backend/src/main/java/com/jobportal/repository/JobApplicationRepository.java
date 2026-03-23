package com.jobportal.repository;

import com.jobportal.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByCandidate_Id(Long candidateId);
    List<JobApplication> findByJobPost_Id(Long jobId);
    Optional<JobApplication> findByCandidate_IdAndJobPost_Id(Long candidateId, Long jobId);
    long countByStatus(JobApplication.Status status);
}