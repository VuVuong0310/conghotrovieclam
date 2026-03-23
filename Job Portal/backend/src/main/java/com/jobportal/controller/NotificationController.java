package com.jobportal.controller;

import com.jobportal.entity.Notification;
import com.jobportal.entity.User;
import com.jobportal.repository.NotificationRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyNotifications(Authentication auth) {
        Optional<User> user = userRepository.findByUsername(auth.getName());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user.get());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        Optional<User> user = userRepository.findByUsername(auth.getName());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        Long count = notificationRepository.countByUserAndIsRead(user.get(), false);
        return ResponseEntity.ok(new UnreadCountResponse(count));
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId, Authentication auth) {
        Optional<User> user = userRepository.findByUsername(auth.getName());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (!notification.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Notification not found"));
        }

        if (!notification.get().getUser().getId().equals(user.get().getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Unauthorized"));
        }

        notification.get().setIsRead(true);
        notificationRepository.save(notification.get());

        return ResponseEntity.ok(new MessageResponse("Notification marked as read"));
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        Optional<User> user = userRepository.findByUsername(auth.getName());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user.get(), false);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId, Authentication auth) {
        Optional<User> user = userRepository.findByUsername(auth.getName());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (!notification.isPresent()) {
            return ResponseEntity.status(404).body(new MessageResponse("Notification not found"));
        }

        if (!notification.get().getUser().getId().equals(user.get().getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Access denied"));
        }

        notificationRepository.delete(notification.get());
        return ResponseEntity.ok(new MessageResponse("Notification deleted"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createNotification(@RequestBody NotificationRequest request, Authentication auth) {
        Optional<User> user = userRepository.findByUsername(auth.getName());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        // Find target user
        Optional<User> targetUser;
        if (request.getUserId() != null) {
            targetUser = userRepository.findById(request.getUserId());
        } else {
            targetUser = Optional.of(user.get());
        }

        if (!targetUser.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Target user not found"));
        }

        Notification notification = new Notification();
        notification.setUser(targetUser.get());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType() != null ? request.getType() : "SYSTEM");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }

    static class NotificationRequest {
        private Long userId;
        private String title;
        private String message;
        private String type;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }

    static class UnreadCountResponse {
        private Long count;
        public UnreadCountResponse(Long count) { this.count = count; }
        public Long getCount() { return count; }
    }
}