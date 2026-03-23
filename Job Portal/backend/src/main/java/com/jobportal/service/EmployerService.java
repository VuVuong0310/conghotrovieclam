package com.jobportal.service;

import com.jobportal.entity.JobApplication;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployerService {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    public List<JobPost> getEmployerJobs(Long employerId) {
        return jobPostRepository.findByEmployer_Id(employerId);
    }

    public List<JobApplication> getJobApplicationsForEmployer(Long employerId, Long jobId) {
        // Verify that the job belongs to this employer
        JobPost job = jobPostRepository.findById(jobId).orElse(null);
        if (job == null || !job.getEmployer().getId().equals(employerId)) {
            throw new RuntimeException("Unauthorized");
        }
        return jobApplicationRepository.findByJobPost_Id(jobId);
    }

    public long getTotalApplications(Long employerId) {
        return getEmployerJobs(employerId).stream()
                .mapToLong(job -> jobApplicationRepository.findByJobPost_Id(job.getId()).size())
                .sum();
    }

    public long getApplicationsByStatus(Long employerId, JobApplication.Status status) {
        return getEmployerJobs(employerId).stream()
                .flatMap(job -> jobApplicationRepository.findByJobPost_Id(job.getId()).stream())
                .filter(app -> app.getStatus() == status)
                .count();
    }
}
