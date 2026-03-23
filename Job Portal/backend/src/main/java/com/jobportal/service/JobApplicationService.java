package com.jobportal.service;

import com.jobportal.entity.JobApplication;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private EmailService emailService;

    public JobApplication apply(User candidate, JobPost job) {
        // Check if already applied
        List<JobApplication> existing = jobApplicationRepository.findByCandidate_Id(candidate.getId());
        for (JobApplication app : existing) {
            if (app.getJobPost().getId().equals(job.getId())) {
                throw new RuntimeException("You have already applied for this job");
            }
        }

        JobApplication application = new JobApplication();
        application.setCandidate(candidate);
        application.setJobPost(job);
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(JobApplication.Status.SUBMITTED);

        JobApplication saved = jobApplicationRepository.save(application);

        // Send email notification
        try {
            emailService.sendApplicationConfirmation(candidate, job);
        } catch (Exception e) {
            // Log error but don't fail the application
            e.printStackTrace();
        }

        return saved;
    }

    public List<JobApplication> getCandidateApplications(Long candidateId) {
        return jobApplicationRepository.findByCandidate_Id(candidateId);
    }

    public Optional<JobApplication> getApplicationById(Long applicationId) {
        return jobApplicationRepository.findById(applicationId);
    }

    public List<JobApplication> getCandidateApplicationsByStatus(Long candidateId, JobApplication.Status status) {
        List<JobApplication> all = jobApplicationRepository.findByCandidate_Id(candidateId);
        return all.stream().filter(a -> a.getStatus() == status).collect(java.util.stream.Collectors.toList());
    }

    public List<JobApplication> getJobApplications(Long jobId) {
        return jobApplicationRepository.findByJobPost_Id(jobId);
    }

    public JobApplication updateStatus(Long applicationId, JobApplication.Status status) {
        Optional<JobApplication> app = jobApplicationRepository.findById(applicationId);
        if (app.isPresent()) {
            JobApplication application = app.get();
            application.setStatus(status);
            JobApplication updated = jobApplicationRepository.save(application);

            // Send email based on status change
            try {
                switch (status) {
                    case REVIEWING:
                        emailService.sendReviewingNotification(application.getCandidate(), application.getJobPost());
                        break;
                    case INTERVIEW:
                        emailService.sendInterviewInvitation(application.getCandidate(), application.getJobPost(),
                            "Bạn đã được mời phỏng vấn. Vui lòng kiểm tra email để biết thêm chi tiết.");
                        break;
                    case ACCEPTED:
                        emailService.sendAcceptanceNotification(application.getCandidate(), application.getJobPost());
                        break;
                    case REJECTED:
                        emailService.sendRejectionNotification(application.getCandidate(), application.getJobPost());
                        break;
                    default:
                        break;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            return updated;
        }
        return null;
    }

    public boolean hasApplied(Long candidateId, Long jobId) {
        List<JobApplication> applications = jobApplicationRepository.findByCandidate_Id(candidateId);
        for (JobApplication app : applications) {
            if (app.getJobPost().getId().equals(jobId)) {
                return true;
            }
        }
        return false;
    }

    public List<JobApplication> getEmployerApplications(Long employerId) {
        // Get all jobs posted by this employer
        List<JobApplication> applicationsList = new java.util.ArrayList<>();
        java.util.List<JobApplication> allApplications = jobApplicationRepository.findAll();
        
        for (JobApplication app : allApplications) {
            if (app.getJobPost().getEmployer() != null && app.getJobPost().getEmployer().getId().equals(employerId)) {
                applicationsList.add(app);
            }
        }
        
        return applicationsList;
    }

    public JobApplication withdrawApplication(Long applicationId, Long candidateId) {
        Optional<JobApplication> app = jobApplicationRepository.findById(applicationId);
        if (app.isPresent()) {
            JobApplication application = app.get();
            // Verify the application belongs to the candidate
            if (application.getCandidate().getId().equals(candidateId)) {
                application.setStatus(JobApplication.Status.WITHDRAWN);
                return jobApplicationRepository.save(application);
            }
        }
        return null;
    }

    public Object getApplicationStats(User user) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        if (user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_CANDIDATE"))) {
            List<JobApplication> candidateApps = getCandidateApplications(user.getId());
            stats.put("totalApplications", candidateApps.size());
            stats.put("submitted", candidateApps.stream().filter(a -> a.getStatus() == JobApplication.Status.SUBMITTED).count());
            stats.put("reviewing", candidateApps.stream().filter(a -> a.getStatus() == JobApplication.Status.REVIEWING).count());
            stats.put("interview", candidateApps.stream().filter(a -> a.getStatus() == JobApplication.Status.INTERVIEW).count());
            stats.put("accepted", candidateApps.stream().filter(a -> a.getStatus() == JobApplication.Status.ACCEPTED).count());
            stats.put("rejected", candidateApps.stream().filter(a -> a.getStatus() == JobApplication.Status.REJECTED).count());
        } else if (user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_EMPLOYER"))) {
            List<JobApplication> employerApps = getEmployerApplications(user.getId());
            stats.put("totalApplications", employerApps.size());
            stats.put("submitted", employerApps.stream().filter(a -> a.getStatus() == JobApplication.Status.SUBMITTED).count());
            stats.put("reviewing", employerApps.stream().filter(a -> a.getStatus() == JobApplication.Status.REVIEWING).count());
            stats.put("interview", employerApps.stream().filter(a -> a.getStatus() == JobApplication.Status.INTERVIEW).count());
            stats.put("accepted", employerApps.stream().filter(a -> a.getStatus() == JobApplication.Status.ACCEPTED).count());
            stats.put("rejected", employerApps.stream().filter(a -> a.getStatus() == JobApplication.Status.REJECTED).count());
        }
        
        return stats;
    }
}