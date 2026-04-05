package com.jobportal.controller;

import com.jobportal.entity.EmployerProfile;
import com.jobportal.entity.JobPost;
import com.jobportal.repository.EmployerProfileRepository;
import com.jobportal.repository.JobPostRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/companies")
    public ResponseEntity<List<EmployerProfile>> getAllCompanies() {
        List<EmployerProfile> companies = employerProfileRepository.findAll();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        return employerProfileRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCompanies", employerProfileRepository.count());
        stats.put("totalJobs", jobPostRepository.countByStatus(JobPost.JobStatus.APPROVED));
        stats.put("totalUsers", userRepository.count());
        return ResponseEntity.ok(stats);
    }
}
