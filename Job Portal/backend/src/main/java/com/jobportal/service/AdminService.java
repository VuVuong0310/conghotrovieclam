package com.jobportal.service;

import com.jobportal.entity.JobApplication;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobPostRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getTotalJobs() {
        return jobPostRepository.count();
    }

    public long getTotalApplications() {
        return jobApplicationRepository.count();
    }

    public long getApplicationsByStatus(JobApplication.Status status) {
        return jobApplicationRepository.countByStatus(status);
    }

    public long getCandidateCount() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> "ROLE_CANDIDATE".equals(role.getName())))
                .count();
    }

    public long getEmployerCount() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> "ROLE_EMPLOYER".equals(role.getName())))
                .count();
    }

    public JobPost approveJobPost(Long jobId) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(JobPost.JobStatus.APPROVED);
        job.setRejectionReason(null);
        return jobPostRepository.save(job);
    }

    public JobPost rejectJobPost(Long jobId, String reason) {
        JobPost job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(JobPost.JobStatus.REJECTED);
        job.setRejectionReason(reason);
        return jobPostRepository.save(job);
    }

    public List<JobPost> getPendingJobs() {
        return jobPostRepository.findByStatus(JobPost.JobStatus.PENDING);
    }
}
