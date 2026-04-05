package com.jobportal.controller;

import com.jobportal.entity.JobPost;
import com.jobportal.service.JobRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.jobportal.repository.UserRepository;
import com.jobportal.entity.User;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecommendationController {

    @Autowired
    private JobRecommendationService recommendationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/jobs")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> getRecommendedJobs(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            if (auth == null) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }

            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<JobPost> recommendations = recommendationService.getRecommendedJobs(userOpt.get().getId(), pageable);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving recommendations: " + e.getMessage());
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingJobs(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(recommendationService.getTrendingJobs(limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving trending jobs: " + e.getMessage());
        }
    }

    @GetMapping("/new")
    public ResponseEntity<?> getNewJobs(
            @RequestParam(defaultValue = "7") int limitDays,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(recommendationService.getNewJobs(limitDays, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving new jobs: " + e.getMessage());
        }
    }

    @GetMapping("/similar/{jobId}")
    public ResponseEntity<?> getSimilarJobs(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            return ResponseEntity.ok(recommendationService.getSimilarJobs(jobId, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving similar jobs: " + e.getMessage());
        }
    }
}
