package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_post_id")
    @JsonIgnoreProperties({"applications", "employer"})
    private JobPost jobPost;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User candidate;

    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status { SUBMITTED, REVIEWING, INTERVIEW, ACCEPTED, REJECTED, WITHDRAWN }

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobPost getJobPost() { return jobPost; }
    public void setJobPost(JobPost jobPost) { this.jobPost = jobPost; }
    public User getCandidate() { return candidate; }
    public void setCandidate(User candidate) { this.candidate = candidate; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}