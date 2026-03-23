package com.jobportal.controller;

import com.jobportal.entity.JobApplication;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.Notification;
import com.jobportal.entity.User;
import com.jobportal.repository.JobPostRepository;
import com.jobportal.repository.NotificationRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getApplicationById(@PathVariable Long applicationId, Authentication auth) {
        try {
            Optional<User> user = userRepository.findByUsername(auth.getName());
            if (!user.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }
            Optional<JobApplication> application = jobApplicationService.getApplicationById(applicationId);
            if (!application.isPresent()) {
                return ResponseEntity.status(404).body(new MessageResponse("Application not found"));
            }
            // Verify ownership: candidate or employer of the job
            JobApplication app = application.get();
            Long userId = user.get().getId();
            boolean isCandidate = app.getCandidate().getId().equals(userId);
            boolean isEmployer = app.getJobPost().getEmployer() != null && app.getJobPost().getEmployer().getId().equals(userId);
            if (!isCandidate && !isEmployer) {
                return ResponseEntity.status(403).body(new MessageResponse("Access denied"));
            }
            return ResponseEntity.ok(app);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> getApplicationsByStatus(@PathVariable String status, Authentication auth) {
        try {
            Optional<User> user = userRepository.findByUsername(auth.getName());
            if (!user.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }
            JobApplication.Status appStatus = JobApplication.Status.valueOf(status.toUpperCase());
            List<JobApplication> applications = jobApplicationService.getCandidateApplicationsByStatus(user.get().getId(), appStatus);
            return ResponseEntity.ok(applications);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid status: " + status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> getMyApplications(Authentication auth) {
        try {
            Optional<User> user = userRepository.findByUsername(auth.getName());
            if (!user.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }
            List<JobApplication> applications = jobApplicationService.getCandidateApplications(user.get().getId());
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> applyForJob(@PathVariable Long jobId, Authentication auth) {
        try {
            Optional<User> candidate = userRepository.findByUsername(auth.getName());
            Optional<JobPost> job = jobPostRepository.findById(jobId);

            if (!candidate.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

            if (!job.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Job not found"));
            }

            // Check deadline
            if (job.get().getDeadline() != null && java.time.LocalDate.now().isAfter(job.get().getDeadline())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Đã hết hạn nộp hồ sơ cho công việc này"));
            }

            // Check if already applied
            if (jobApplicationService.hasApplied(candidate.get().getId(), jobId)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Already applied for this job"));
            }

            JobApplication application = jobApplicationService.apply(candidate.get(), job.get());

            // Create notification for employer
            Notification notification = new Notification();
            notification.setUser(job.get().getEmployer());
            notification.setTitle("Đơn ứng tuyển mới");
            notification.setMessage("Bạn có đơn ứng tuyển mới cho công việc: " + job.get().getTitle());
            notification.setType("APPLICATION");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);

            return ResponseEntity.ok(new MessageResponse("Application submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> checkIfApplied(@PathVariable Long jobId, Authentication auth) {
        try {
            Optional<User> candidate = userRepository.findByUsername(auth.getName());
            if (candidate.isPresent()) {
                boolean applied = jobApplicationService.hasApplied(candidate.get().getId(), jobId);
                return ResponseEntity.ok(new AppliedResponse(applied));
            }
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/employer")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> getApplicationsForEmployer(Authentication auth) {
        try {
            Optional<User> employer = userRepository.findByUsername(auth.getName());
            if (employer.isPresent()) {
                List<JobApplication> applications = jobApplicationService.getEmployerApplications(employer.get().getId());
                return ResponseEntity.ok(applications);
            }
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> getJobApplications(@PathVariable Long jobId, Authentication auth) {
        try {
            List<JobApplication> applications = jobApplicationService.getJobApplications(jobId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long applicationId,
                                                     @RequestBody StatusUpdateRequest request,
                                                     Authentication auth) {
        try {
            JobApplication application = jobApplicationService.updateStatus(applicationId, request.getStatus());

            // Create notification for candidate
            Notification notification = new Notification();
            notification.setUser(application.getCandidate());
            notification.setTitle("Cập nhật trạng thái ứng tuyển");
            notification.setMessage("Đơn ứng tuyển của bạn cho công việc '" + application.getJobPost().getTitle() + "' đã được cập nhật: " + getStatusMessage(request.getStatus()));
            notification.setType("STATUS_UPDATE");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);

            return ResponseEntity.ok(new MessageResponse("Status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{applicationId}/interview")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYER')")
    public ResponseEntity<?> scheduleInterview(@PathVariable Long applicationId,
                                                @RequestBody InterviewRequest request,
                                                Authentication auth) {
        try {
            Optional<User> employer = userRepository.findByUsername(auth.getName());
            if (!employer.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

            JobApplication application = jobApplicationService.updateStatus(applicationId, JobApplication.Status.INTERVIEW);
            if (application == null) {
                return ResponseEntity.status(404).body(new MessageResponse("Application not found"));
            }

            // Create notification for candidate
            Notification notification = new Notification();
            notification.setUser(application.getCandidate());
            notification.setTitle("Mời phỏng vấn");
            String message = "Bạn được mời phỏng vấn cho công việc: " + application.getJobPost().getTitle();
            if (request.getInterviewDate() != null) {
                message += " - Ngày: " + request.getInterviewDate();
            }
            if (request.getLocation() != null) {
                message += " - Địa điểm: " + request.getLocation();
            }
            notification.setMessage(message);
            notification.setType("INTERVIEW");
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);

            return ResponseEntity.ok(new MessageResponse("Interview scheduled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{applicationId}/withdraw")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> withdrawApplication(@PathVariable Long applicationId, Authentication auth) {
        try {
            Optional<User> candidate = userRepository.findByUsername(auth.getName());
            if (!candidate.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

            JobApplication application = jobApplicationService.withdrawApplication(applicationId, candidate.get().getId());
            return ResponseEntity.ok(new MessageResponse("Application withdrawn successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_EMPLOYER')")
    public ResponseEntity<?> getApplicationStats(Authentication auth) {
        try {
            Optional<User> user = userRepository.findByUsername(auth.getName());
            if (user.isPresent()) {
                Object stats = jobApplicationService.getApplicationStats(user.get());
                return ResponseEntity.ok(stats);
            }
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    private String getStatusMessage(JobApplication.Status status) {
        switch (status) {
            case REVIEWING: return "Đang được xem xét";
            case INTERVIEW: return "Được mời phỏng vấn";
            case ACCEPTED: return "Được chấp nhận";
            case REJECTED: return "Bị từ chối";
            default: return "Đã cập nhật";
        }
    }

    static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    static class AppliedResponse {
        private boolean applied;

        public AppliedResponse(boolean applied) {
            this.applied = applied;
        }

        public boolean isApplied() {
            return applied;
        }

        public void setApplied(boolean applied) {
            this.applied = applied;
        }
    }

    static class InterviewRequest {
        private String interviewDate;
        private String location;
        private String notes;

        public String getInterviewDate() { return interviewDate; }
        public void setInterviewDate(String interviewDate) { this.interviewDate = interviewDate; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    static class StatusUpdateRequest {
        private JobApplication.Status status;
        private String notes;

        public JobApplication.Status getStatus() {
            return status;
        }

        public void setStatus(JobApplication.Status status) {
            this.status = status;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}