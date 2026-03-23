package com.jobportal.service;

import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.JobPostRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobRecommendationService {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Recommends jobs to a candidate based on:
     * 1. Skills matching (candidate skills vs job description)
     * 2. Salary expectation
     * 3. Location preference
     */
    public Page<JobPost> getRecommendedJobs(Long userId, Pageable pageable) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Page.empty();
        }

        Optional<CandidateProfile> profileOpt = candidateProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return Page.empty();
        }

        CandidateProfile profile = profileOpt.get();
        List<JobPost> allJobs = jobPostRepository.findAll();

        // Score and filter jobs
        List<JobPost> scoredJobs = allJobs.stream()
            .map(job -> new AbstractMap.SimpleEntry<>(job, calculateRecommendationScore(job, profile)))
            .filter(entry -> entry.getValue() > 0)  // Only include scored jobs
            .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), scoredJobs.size());
        List<JobPost> pageContent = scoredJobs.subList(start, Math.max(start, end));

        return new PageImpl<>(pageContent, pageable, scoredJobs.size());
    }

    /**
     * Calculate recommendation score based on multiple factors
     * Max score: 100
     */
    private double calculateRecommendationScore(JobPost job, CandidateProfile profile) {
        double score = 0;

        String candidateSkills = profile.getSkills() != null ? String.join(" ", profile.getSkills()).toLowerCase() : "";
        String jobDescription = job.getDescription().toLowerCase();

        // Skills matching (40 points max)
        String[] skills = candidateSkills.split(",");
        for (String skill : skills) {
            skill = skill.trim();
            if (!skill.isEmpty() && jobDescription.contains(skill)) {
                score += 5;  // 5 points per matched skill
            }
        }
        score = Math.min(score, 40);  // Max 40 for skills

        // Title keyword matching (30 points)
        String[] titleKeywords = {"senior", "junior", "lead", "manager", "developer", "engineer", "analyst"};
        for (String keyword : titleKeywords) {
            if (job.getTitle().toLowerCase().contains(keyword) && 
                jobDescription.contains(keyword)) {
                score += 5;
            }
        }
        score = Math.min(score, 70);  // Running max

        // Location preference (15 points)
        String candidateLocation = profile.getAddress() != null ? profile.getAddress().toLowerCase() : "";
        if (!candidateLocation.isEmpty() && job.getLocation().toLowerCase().contains(candidateLocation)) {
            score += 15;
        }

        // Salary alignment (15 points) - assuming no salary range in profile, we deduce from job offering
        // If job salary is in a reasonable range, add points
        if (job.getSalary() != null && job.getSalary() > 10000000) {  // VND currency checking
            score += 15;
        }

        return Math.min(score, 100);
    }

    /**
     * Get trending jobs (most applied to)
     */
    public List<JobPost> getTrendingJobs(int limit) {
        return jobPostRepository.findAll().stream()
            .sorted((a, b) -> Integer.compare(
                b.getApplications().size(), 
                a.getApplications().size()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get new jobs added in the last N days
     */
    public List<JobPost> getNewJobs(int limitDays, int limit) {
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(limitDays);
        
        return jobPostRepository.findAll().stream()
            .filter(job -> job.getCreatedAt().isAfter(startDate))
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get similar jobs by location and employment type
     */
    public List<JobPost> getSimilarJobs(Long jobId, int limit) {
        Optional<JobPost> jobOpt = jobPostRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return List.of();
        }

        JobPost referenceJob = jobOpt.get();
        
        return jobPostRepository.findAll().stream()
            .filter(job -> !job.getId().equals(jobId))
            .filter(job -> {
                boolean locationMatch = job.getLocation().equalsIgnoreCase(referenceJob.getLocation());
                boolean typeMatch = job.getEmploymentType().equalsIgnoreCase(referenceJob.getEmploymentType());
                return locationMatch || typeMatch;
            })
            .limit(limit)
            .collect(Collectors.toList());
    }
}
