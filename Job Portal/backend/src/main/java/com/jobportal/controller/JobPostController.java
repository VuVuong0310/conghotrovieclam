package com.jobportal.controller;

import com.jobportal.entity.JobCategory;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.repository.JobCategoryRepository;
import com.jobportal.repository.JobPostRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
public class JobPostController {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    @GetMapping
    public List<JobPost> listAll() {
        // Only return APPROVED jobs for public listing
        return jobPostRepository.findByStatus(JobPost.JobStatus.APPROVED);
    }

    @GetMapping("/{id}")
    public Optional<JobPost> getById(@PathVariable Long id) {
        return jobPostRepository.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    public ResponseEntity<?> create(@RequestBody JobPost job, Authentication auth) {
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (employer.isPresent()) {
            job.setEmployer(employer.get());
        }
        job.setCreatedAt(java.time.LocalDateTime.now());
        // Admin-created jobs are auto-approved
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        job.setStatus(isAdmin ? JobPost.JobStatus.APPROVED : JobPost.JobStatus.PENDING);

        // Link category if categoryId is provided
        if (job.getCategory() != null && job.getCategory().getId() != null) {
            Optional<JobCategory> cat = jobCategoryRepository.findById(job.getCategory().getId());
            cat.ifPresent(job::setCategory);
        }

        JobPost saved = jobPostRepository.save(job);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYER', 'ROLE_ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody JobPost job, Authentication auth) {
        Optional<JobPost> existing = jobPostRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest().body("Job not found");
        }
        // Verify ownership
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (employer.isEmpty() || !existing.get().getEmployer().getId().equals(employer.get().getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        job.setId(id);
        job.setEmployer(existing.get().getEmployer());
        job.setCreatedAt(existing.get().getCreatedAt());
        job.setStatus(existing.get().getStatus());
        return ResponseEntity.ok(jobPostRepository.save(job));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        Optional<JobPost> existing = jobPostRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest().body("Job not found");
        }
        // Verify ownership
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (employer.isEmpty() || !existing.get().getEmployer().getId().equals(employer.get().getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        jobPostRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}