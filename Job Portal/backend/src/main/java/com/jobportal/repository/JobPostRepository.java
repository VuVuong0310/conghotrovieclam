package com.jobportal.repository;

import com.jobportal.entity.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Long>, JpaSpecificationExecutor<JobPost> {
    List<JobPost> findByStatus(JobPost.JobStatus status);
    List<JobPost> findByStatusAndActive(JobPost.JobStatus status, boolean active);
    List<JobPost> findByEmployer_Id(Long employerId);
    long countByStatus(JobPost.JobStatus status);
}