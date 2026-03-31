package com.jobportal.controller;

import com.jobportal.entity.JobCategory;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobCategoryRepository;
import com.jobportal.repository.JobPostRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.AdminService;
import com.jobportal.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private JobCategoryRepository jobCategoryRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    // --- User Management ---
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream().map(u -> {
            UserResponse ur = new UserResponse();
            ur.setId(u.getId());
            ur.setUsername(u.getUsername());
            ur.setEnabled(u.isEnabled());
            ur.setRoles(u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()));
            return ur;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/toggle-lock")
    public ResponseEntity<?> toggleUserLock(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }
        User user = userOpt.get();
        // Prevent admin from locking themselves
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()))) {
            return ResponseEntity.badRequest().body(new MessageResponse("Không thể khóa tài khoản Admin"));
        }
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        String status = user.isEnabled() ? "mở khóa" : "khóa";
        return ResponseEntity.ok(new MessageResponse("Đã " + status + " tài khoản: " + user.getUsername()));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }
        User user = userOpt.get();
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()))) {
            return ResponseEntity.badRequest().body(new MessageResponse("Không thể xóa tài khoản Admin"));
        }
        // Check employer has job posts
        if (jobPostRepository.existsByEmployer_Id(userId)) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Không thể xóa người dùng này vì họ có tin tuyển dụng. Hãy xóa tin tuyển dụng trước."));
        }
        // Check candidate has job applications
        if (jobApplicationRepository.existsByCandidate_Id(userId)) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Không thể xóa người dùng này vì họ có đơn ứng tuyển. Hãy xóa đơn ứng tuyển trước."));
        }
        userRepository.delete(user);
        return ResponseEntity.ok(new MessageResponse("Đã xóa tài khoản: " + user.getUsername()));
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<?> getPendingJobs() {
        List<JobPost> pendingJobs = adminService.getPendingJobs();
        return ResponseEntity.ok(pendingJobs);
    }

    // --- All Jobs Management ---
    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobs() {
        List<JobPost> allJobs = jobPostRepository.findAll();
        return ResponseEntity.ok(allJobs);
    }

    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<?> updateJob(@PathVariable Long jobId, @RequestBody JobPost updatedJob) {
        Optional<JobPost> jobOpt = jobPostRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Job not found"));
        }
        JobPost job = jobOpt.get();
        if (updatedJob.getTitle() != null) job.setTitle(updatedJob.getTitle());
        if (updatedJob.getDescription() != null) job.setDescription(updatedJob.getDescription());
        if (updatedJob.getLocation() != null) job.setLocation(updatedJob.getLocation());
        if (updatedJob.getEmploymentType() != null) job.setEmploymentType(updatedJob.getEmploymentType());
        if (updatedJob.getSalary() != null) job.setSalary(updatedJob.getSalary());
        if (updatedJob.getStatus() != null) job.setStatus(updatedJob.getStatus());
        jobPostRepository.save(job);
        return ResponseEntity.ok(new MessageResponse("Cập nhật tin tuyển dụng thành công"));
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<?> deleteJob(@PathVariable Long jobId) {
        if (!jobPostRepository.existsById(jobId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Job not found"));
        }
        // Prevent deleting job that has applications
        if (jobApplicationRepository.existsByJobPost_Id(jobId)) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Không thể xóa tin tuyển dụng này vì đã có đơn ứng tuyển. Hãy xóa các đơn ứng tuyển trước."));
        }
        jobPostRepository.deleteById(jobId);
        return ResponseEntity.ok(new MessageResponse("Đã xóa tin tuyển dụng"));
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        StatisticsResponse stats = new StatisticsResponse();
        stats.setTotalUsers(adminService.getTotalUsers());
        stats.setTotalCandidates(adminService.getCandidateCount());
        stats.setTotalEmployers(adminService.getEmployerCount());
        stats.setTotalJobs(adminService.getTotalJobs());
        stats.setTotalApplications(adminService.getTotalApplications());
        stats.setSubmittedApplications(adminService.getApplicationsByStatus(
            com.jobportal.entity.JobApplication.Status.SUBMITTED));
        stats.setReviewingApplications(adminService.getApplicationsByStatus(
            com.jobportal.entity.JobApplication.Status.REVIEWING));
        stats.setInterviewApplications(adminService.getApplicationsByStatus(
            com.jobportal.entity.JobApplication.Status.INTERVIEW));
        stats.setAcceptedApplications(adminService.getApplicationsByStatus(
            com.jobportal.entity.JobApplication.Status.ACCEPTED));
        stats.setRejectedApplications(adminService.getApplicationsByStatus(
            com.jobportal.entity.JobApplication.Status.REJECTED));

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/jobs/{jobId}/toggle-active")
    public ResponseEntity<?> toggleJobActive(@PathVariable Long jobId) {
        Optional<JobPost> jobOpt = jobPostRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Job not found"));
        }
        JobPost job = jobOpt.get();
        job.setActive(!job.isActive());
        jobPostRepository.save(job);
        String status = job.isActive() ? "bật" : "tắt";
        return ResponseEntity.ok(new MessageResponse("Đã " + status + " tin tuyển dụng: " + job.getTitle()));
    }

    @PostMapping("/jobs/{jobId}/approve")
    public ResponseEntity<?> approveJobPost(@PathVariable Long jobId) {
        try {
            JobPost job = adminService.approveJobPost(jobId);
            // Send approval email to employer
            try {
                emailService.sendJobApprovalNotification(job.getEmployer(), job);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return ResponseEntity.ok(new MessageResponse("Job approved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/jobs/{jobId}/reject")
    public ResponseEntity<?> rejectJobPost(@PathVariable Long jobId, @RequestBody RejectRequest request) {
        try {
            JobPost job = adminService.rejectJobPost(jobId, request.getReason());
            // Send rejection email to employer
            try {
                emailService.sendJobRejectionNotification(job.getEmployer(), job, request.getReason());
            } catch (Exception e) {
                e.printStackTrace();
            }
            return ResponseEntity.ok(new MessageResponse("Job rejected"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- Category Management ---
    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(jobCategoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody JobCategory category) {
        return ResponseEntity.ok(jobCategoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody JobCategory category) {
        Optional<JobCategory> existing = jobCategoryRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Category not found"));
        }
        existing.get().setName(category.getName());
        existing.get().setDescription(category.getDescription());
        return ResponseEntity.ok(jobCategoryRepository.save(existing.get()));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!jobCategoryRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Category not found"));
        }
        // Prevent deleting category that has job posts referencing it
        if (jobPostRepository.existsByCategory_Id(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse(
                "Không thể xóa danh mục này vì có tin tuyển dụng đang sử dụng. Hãy đổi danh mục cho các tin đó trước."));
        }
        jobCategoryRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa danh mục"));
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestBody TestEmailRequest request) {
        try {
            User testUser = new User();
            testUser.setUsername(request.getEmail());
            
            JobPost testJob = new JobPost();
            testJob.setTitle("Test Job Position");
            testJob.setLocation("Test Location");
            testJob.setEmploymentType("Full-time");
            testJob.setSalary(50000.0);
            
            emailService.sendApplicationConfirmation(testUser, testJob);
            
            return ResponseEntity.ok(new MessageResponse("Test email sent successfully to " + request.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to send test email: " + e.getMessage()));
        }
    }

    static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    static class RejectRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    static class TestEmailRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    static class StatisticsResponse {
        private long totalUsers;
        private long totalCandidates;
        private long totalEmployers;
        private long totalJobs;
        private long totalApplications;
        private long submittedApplications;
        private long reviewingApplications;
        private long interviewApplications;
        private long acceptedApplications;
        private long rejectedApplications;

        // Getters and Setters
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

        public long getTotalCandidates() { return totalCandidates; }
        public void setTotalCandidates(long totalCandidates) { this.totalCandidates = totalCandidates; }

        public long getTotalEmployers() { return totalEmployers; }
        public void setTotalEmployers(long totalEmployers) { this.totalEmployers = totalEmployers; }

        public long getTotalJobs() { return totalJobs; }
        public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

        public long getTotalApplications() { return totalApplications; }
        public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

        public long getSubmittedApplications() { return submittedApplications; }
        public void setSubmittedApplications(long submittedApplications) { this.submittedApplications = submittedApplications; }

        public long getReviewingApplications() { return reviewingApplications; }
        public void setReviewingApplications(long reviewingApplications) { this.reviewingApplications = reviewingApplications; }

        public long getInterviewApplications() { return interviewApplications; }
        public void setInterviewApplications(long interviewApplications) { this.interviewApplications = interviewApplications; }

        public long getAcceptedApplications() { return acceptedApplications; }
        public void setAcceptedApplications(long acceptedApplications) { this.acceptedApplications = acceptedApplications; }

        public long getRejectedApplications() { return rejectedApplications; }
        public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }
    }

    static class UserResponse {
        private Long id;
        private String username;
        private boolean enabled;
        private List<String> roles;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
    }
}
