package com.jobportal.controller;

import com.jobportal.entity.JobApplication;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.entity.EmployerProfile;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.EmployerProfileRepository;
import com.jobportal.service.EmployerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employer")
public class EmployerDashboardController {

    @Autowired
    private EmployerService employerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployerProfileRepository employerProfileRepository;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (!employer.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Employer not found"));
        }

        Long employerId = employer.get().getId();
        DashboardResponse dashboard = new DashboardResponse();
        dashboard.setTotalJobs(employerService.getEmployerJobs(employerId).size());
        dashboard.setTotalApplications(employerService.getTotalApplications(employerId));
        dashboard.setSubmittedApplications(employerService.getApplicationsByStatus(employerId, JobApplication.Status.SUBMITTED));
        dashboard.setReviewingApplications(employerService.getApplicationsByStatus(employerId, JobApplication.Status.REVIEWING));
        dashboard.setInterviewApplications(employerService.getApplicationsByStatus(employerId, JobApplication.Status.INTERVIEW));

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> getMyJobs(Authentication auth) {
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (!employer.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Employer not found"));
        }

        List<JobPost> jobs = employerService.getEmployerJobs(employer.get().getId());
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> getJobApplications(@PathVariable Long jobId, Authentication auth) {
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (!employer.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Employer not found"));
        }

        try {
            List<JobApplication> applications = employerService.getJobApplicationsForEmployer(employer.get().getId(), jobId);
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- Company Profile Management ---
    @GetMapping("/company-profile")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> getCompanyProfile(Authentication auth) {
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (employer.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Employer not found"));
        }
        Optional<EmployerProfile> profile = employerProfileRepository.findByUser_Id(employer.get().getId());
        if (profile.isEmpty()) {
            EmployerProfile newProfile = new EmployerProfile();
            newProfile.setUser(employer.get());
            return ResponseEntity.ok(employerProfileRepository.save(newProfile));
        }
        return ResponseEntity.ok(profile.get());
    }

    @PutMapping("/company-profile")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> updateCompanyProfile(@RequestBody EmployerProfile updated, Authentication auth) {
        Optional<User> employer = userRepository.findByUsername(auth.getName());
        if (employer.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Employer not found"));
        }
        Optional<EmployerProfile> profileOpt = employerProfileRepository.findByUser_Id(employer.get().getId());
        EmployerProfile profile;
        if (profileOpt.isEmpty()) {
            profile = new EmployerProfile();
            profile.setUser(employer.get());
        } else {
            profile = profileOpt.get();
        }
        profile.setCompanyName(updated.getCompanyName());
        profile.setCompanyDescription(updated.getCompanyDescription());
        profile.setIndustry(updated.getIndustry());
        profile.setCompanySize(updated.getCompanySize());
        profile.setWebsite(updated.getWebsite());
        profile.setAddress(updated.getAddress());
        profile.setPhone(updated.getPhone());
        profile.setLogoUrl(updated.getLogoUrl());
        employerProfileRepository.save(profile);
        return ResponseEntity.ok(profile);
    }

    static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    static class DashboardResponse {
        private long totalJobs;
        private long totalApplications;
        private long submittedApplications;
        private long reviewingApplications;
        private long interviewApplications;

        // Getters and Setters
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
    }
}
