package com.jobportal.controller;

import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.CandidateProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class CandidateProfileController {

    @Autowired
    private CandidateProfileService candidateProfileService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public Optional<CandidateProfile> getProfile(@PathVariable Long userId) {
        return candidateProfileService.getProfile(userId);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody CandidateProfile profile, Authentication auth) {
        // IDOR protection: only the owner can update their own profile
        Optional<User> currentUser = userRepository.findByUsername(auth.getName());
        if (currentUser.isEmpty() || !currentUser.get().getId().equals(userId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền chỉnh sửa hồ sơ này"));
        }
        try {
            return ResponseEntity.ok(candidateProfileService.updateProfile(userId, profile));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{userId}/resume")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> uploadResume(@PathVariable Long userId, @RequestParam("file") MultipartFile file, Authentication auth) {
        // IDOR protection
        Optional<User> currentUser = userRepository.findByUsername(auth.getName());
        if (currentUser.isEmpty() || !currentUser.get().getId().equals(userId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền upload resume cho hồ sơ này"));
        }
        try {
            String filename = candidateProfileService.uploadResume(userId, file);
            return ResponseEntity.ok(new MessageResponse("Resume uploaded successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Failed to upload resume"));
        }
    }

    @GetMapping("/{userId}/resume")
    public ResponseEntity<?> downloadResume(@PathVariable Long userId) {
        try {
            Path filePath = candidateProfileService.getResumePath(userId);
            if (filePath == null || !filePath.toFile().exists()) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"resume.pdf\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{userId}/cv")
    public ResponseEntity<?> renderCv(@PathVariable Long userId,
            @RequestParam(value = "template", defaultValue = "classic") String template) {
        String html = candidateProfileService.renderCvHtml(userId, template);
        if (html == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(new org.springframework.http.MediaType("text", "html", java.nio.charset.StandardCharsets.UTF_8))
                .body(html);
    }

    @PostMapping("/{userId}/photo")
    @PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long userId, @RequestParam("file") MultipartFile file, Authentication auth) {
        // IDOR protection
        Optional<User> currentUser = userRepository.findByUsername(auth.getName());
        if (currentUser.isEmpty() || !currentUser.get().getId().equals(userId)) {
            return ResponseEntity.status(403).body(new MessageResponse("Không có quyền upload ảnh cho hồ sơ này"));
        }
        try {
            String filename = candidateProfileService.uploadProfileImage(userId, file);
            return ResponseEntity.ok(new MessageResponse("Photo uploaded successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Failed to upload photo"));
        }
    }

    @GetMapping("/{userId}/photo")
    public ResponseEntity<?> getPhoto(@PathVariable Long userId) {
        try {
            Path filePath = candidateProfileService.getProfileImagePath(userId);
            if (filePath == null || !filePath.toFile().exists()) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = filePath.toString().endsWith(".png") ? "image/png" : "image/jpeg";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}