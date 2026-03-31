package com.jobportal.controller;

import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.Education;
import com.jobportal.entity.Experience;
import com.jobportal.entity.Project;
import com.jobportal.entity.User;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.EducationRepository;
import com.jobportal.repository.ExperienceRepository;
import com.jobportal.repository.ProjectRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
public class CandidateDetailController {

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    /** Trả về lỗi 403 nếu user đang đăng nhập không phải là chủ của candidateId */
    private boolean isOwner(Authentication auth, Long candidateId) {
        Optional<User> user = userRepository.findByUsername(auth.getName());
        return user.isPresent() && user.get().getId().equals(candidateId);
    }

    // --- Education CRUD ---

    @GetMapping("/{candidateId}/educations")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE','ROLE_EMPLOYER','ROLE_ADMIN')")
    public ResponseEntity<?> getEducations(@PathVariable Long candidateId) {
        List<Education> educations = educationRepository.findByCandidate_Id(candidateId);
        return ResponseEntity.ok(educations);
    }

    @PostMapping("/{candidateId}/educations")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> addEducation(@PathVariable Long candidateId, @RequestBody Education education, Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền thêm dữ liệu cho hồ sơ này"));
        }
        Optional<CandidateProfile> profile = candidateProfileRepository.findById(candidateId);
        if (profile.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Candidate profile not found"));
        }
        education.setCandidate(profile.get());
        Education saved = educationRepository.save(education);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{candidateId}/educations/{educationId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> updateEducation(@PathVariable Long candidateId,
                                              @PathVariable Long educationId,
                                              @RequestBody Education education,
                                              Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền chỉnh sửa dữ liệu này"));
        }
        Optional<Education> existing = educationRepository.findById(educationId);
        if (existing.isEmpty() || !existing.get().getCandidate().getId().equals(candidateId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Education not found"));
        }
        education.setId(educationId);
        education.setCandidate(existing.get().getCandidate());
        return ResponseEntity.ok(educationRepository.save(education));
    }

    @DeleteMapping("/{candidateId}/educations/{educationId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> deleteEducation(@PathVariable Long candidateId, @PathVariable Long educationId, Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền xóa dữ liệu này"));
        }
        Optional<Education> existing = educationRepository.findById(educationId);
        if (existing.isEmpty() || !existing.get().getCandidate().getId().equals(candidateId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Education not found"));
        }
        educationRepository.deleteById(educationId);
        return ResponseEntity.ok(new MessageResponse("Education deleted"));
    }

    // --- Experience CRUD ---

    @GetMapping("/{candidateId}/experiences")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE','ROLE_EMPLOYER','ROLE_ADMIN')")
    public ResponseEntity<?> getExperiences(@PathVariable Long candidateId) {
        List<Experience> experiences = experienceRepository.findByCandidate_Id(candidateId);
        return ResponseEntity.ok(experiences);
    }

    @PostMapping("/{candidateId}/experiences")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> addExperience(@PathVariable Long candidateId, @RequestBody Experience experience, Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền thêm dữ liệu cho hồ sơ này"));
        }
        Optional<CandidateProfile> profile = candidateProfileRepository.findById(candidateId);
        if (profile.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Candidate profile not found"));
        }
        experience.setCandidate(profile.get());
        Experience saved = experienceRepository.save(experience);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{candidateId}/experiences/{experienceId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> updateExperience(@PathVariable Long candidateId,
                                               @PathVariable Long experienceId,
                                               @RequestBody Experience experience,
                                               Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền chỉnh sửa dữ liệu này"));
        }
        Optional<Experience> existing = experienceRepository.findById(experienceId);
        if (existing.isEmpty() || !existing.get().getCandidate().getId().equals(candidateId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Experience not found"));
        }
        experience.setId(experienceId);
        experience.setCandidate(existing.get().getCandidate());
        return ResponseEntity.ok(experienceRepository.save(experience));
    }

    @DeleteMapping("/{candidateId}/experiences/{experienceId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> deleteExperience(@PathVariable Long candidateId, @PathVariable Long experienceId, Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền xóa dữ liệu này"));
        }
        Optional<Experience> existing = experienceRepository.findById(experienceId);
        if (existing.isEmpty() || !existing.get().getCandidate().getId().equals(candidateId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Experience not found"));
        }
        experienceRepository.deleteById(experienceId);
        return ResponseEntity.ok(new MessageResponse("Experience deleted"));
    }

    // --- Project CRUD ---

    @GetMapping("/{candidateId}/projects")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE','ROLE_EMPLOYER','ROLE_ADMIN')")
    public ResponseEntity<?> getProjects(@PathVariable Long candidateId) {
        List<Project> projects = projectRepository.findByCandidate_Id(candidateId);
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/{candidateId}/projects")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> addProject(@PathVariable Long candidateId, @RequestBody Project project, Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền thêm dữ liệu cho hồ sơ này"));
        }
        Optional<CandidateProfile> profile = candidateProfileRepository.findById(candidateId);
        if (profile.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Candidate profile not found"));
        }
        project.setCandidate(profile.get());
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{candidateId}/projects/{projectId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> updateProject(@PathVariable Long candidateId,
                                            @PathVariable Long projectId,
                                            @RequestBody Project project,
                                            Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền chỉnh sửa dữ liệu này"));
        }
        Optional<Project> existing = projectRepository.findById(projectId);
        if (existing.isEmpty() || !existing.get().getCandidate().getId().equals(candidateId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Project not found"));
        }
        project.setId(projectId);
        project.setCandidate(existing.get().getCandidate());
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @DeleteMapping("/{candidateId}/projects/{projectId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> deleteProject(@PathVariable Long candidateId, @PathVariable Long projectId, Authentication auth) {
        if (!isOwner(auth, candidateId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền xóa dữ liệu này"));
        }
        Optional<Project> existing = projectRepository.findById(projectId);
        if (existing.isEmpty() || !existing.get().getCandidate().getId().equals(candidateId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Project not found"));
        }
        projectRepository.deleteById(projectId);
        return ResponseEntity.ok(new MessageResponse("Project deleted"));
    }

    static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}
