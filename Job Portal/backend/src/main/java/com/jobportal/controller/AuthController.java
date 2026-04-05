package com.jobportal.controller;

import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.RoleRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtils;
import com.jobportal.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${google.client.secret:}")
    private String googleClientSecret;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Get user info for response
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            java.util.List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), roles));
        }

        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getUsername()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        // Special case: assign ADMIN role to specific email
        if ("vuvanvuong2004@gmail.com".equals(signUpRequest.getUsername())) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Admin role is not found."));
            roles.add(adminRole);
        } else if (strRoles == null) {
            Role userRole = roleRepository.findByName("ROLE_CANDIDATE")
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(r -> {
                // Only allow CANDIDATE or EMPLOYER to be self-assigned via registration
                if (!"ROLE_CANDIDATE".equals(r) && !"ROLE_EMPLOYER".equals(r)) {
                    throw new RuntimeException("Error: Role không hợp lệ.");
                }
                Role role = roleRepository.findByName(r)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(role);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getEmail());
        if (userOpt.isEmpty()) {
            // Return OK anyway to prevent email enumeration
            return ResponseEntity.ok(new MessageResponse("Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu."));
        }
        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        String resetLink = "https://conghotrovieclam.online/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getUsername(), resetLink);

        return ResponseEntity.ok(new MessageResponse("Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu."));
    }

    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email không tồn tại trong hệ thống."));
        }
        return ResponseEntity.ok(new MessageResponse("Email hợp lệ."));
    }

    @PostMapping("/verify-and-change-password")
    public ResponseEntity<?> verifyAndChangePassword(@RequestBody VerifyChangePasswordRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email không tồn tại."));
        }
        User user = userOpt.get();
        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mật khẩu cũ không đúng."));
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mật khẩu mới phải có ít nhất 6 ký tự."));
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công!"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByResetToken(request.getToken());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token không hợp lệ hoặc đã hết hạn."));
        }
        User user = userOpt.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token đã hết hạn. Vui lòng yêu cầu lại."));
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mật khẩu mới phải có ít nhất 6 ký tự."));
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Đặt lại mật khẩu thành công!"));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            // Exchange authorization code for tokens
            String tokenEndpoint = "https://oauth2.googleapis.com/token";

            org.springframework.util.LinkedMultiValueMap<String, String> tokenParams = new org.springframework.util.LinkedMultiValueMap<>();
            tokenParams.add("code", request.getCredential());
            tokenParams.add("client_id", googleClientId);
            tokenParams.add("client_secret", googleClientSecret);
            tokenParams.add("redirect_uri", "https://conghotrovieclam.online/jobportal/google-callback");
            tokenParams.add("grant_type", "authorization_code");

            org.springframework.http.HttpHeaders tokenHeaders = new org.springframework.http.HttpHeaders();
            tokenHeaders.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> tokenRequest =
                new org.springframework.http.HttpEntity<>(tokenParams, tokenHeaders);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            // Get access token
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = restTemplate.postForObject(tokenEndpoint, tokenRequest, Map.class);
            String accessToken = (String) tokenResponse.get("access_token");

            // Get user info
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            @SuppressWarnings("unchecked")
            Map<String, Object> userInfo = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                org.springframework.http.HttpMethod.GET, entity, Map.class).getBody();

            String email = (String) userInfo.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Không lấy được email từ Google."));
            }

            // Find or create user
            Optional<User> userOpt = userRepository.findByUsername(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                // Check if account is locked
                if (!user.isEnabled()) {
                    return ResponseEntity.status(403).body(new MessageResponse("Tài khoản đã bị khóa."));
                }
            } else {
                user = new User();
                user.setUsername(email);
                user.setPassword(encoder.encode(UUID.randomUUID().toString()));
                Set<Role> roles = new HashSet<>();
                Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(candidateRole);
                user.setRoles(roles);
                userRepository.save(user);
            }

            // Generate JWT
            String jwt = jwtUtils.generateTokenFromUsername(email);
            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), roles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Đăng nhập Google thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password-direct")
    public ResponseEntity<?> resetPasswordDirect(@RequestBody ResetPasswordDirectRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email không được để trống."));
        }
        Optional<User> userOpt = userRepository.findByUsername(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email không tồn tại trong hệ thống."));
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mật khẩu mới phải có ít nhất 6 ký tự."));
        }
        User user = userOpt.get();
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Đặt lại mật khẩu thành công!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new MessageResponse("Bạn chưa đăng nhập."));
        }
        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Không tìm thấy người dùng."));
        }
        User user = userOpt.get();
        if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mật khẩu hiện tại không đúng."));
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Mật khẩu mới phải có ít nhất 6 ký tự."));
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công!"));
    }

    // DTO classes
    static class LoginRequest {
        private String username;
        private String password;
        // getters & setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class SignupRequest {
        private String username;
        private String password;
        private Set<String> role;
        // getters & setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public Set<String> getRole() { return role; }
        public void setRole(Set<String> role) { this.role = role; }
    }

    static class JwtResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private java.util.List<String> roles;

        public JwtResponse(String accessToken) {
            this.token = accessToken;
        }

        public JwtResponse(String accessToken, Long id, String username, java.util.List<String> roles) {
            this.token = accessToken;
            this.id = id;
            this.username = username;
            this.roles = roles;
        }

        // getters
        public String getToken() { return token; }
        public String getType() { return type; }
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public java.util.List<String> getRoles() { return roles; }
    }

    static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }

    static class ForgotPasswordRequest {
        private String email;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    static class ResetPasswordRequest {
        private String token;
        private String newPassword;
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    static class GoogleLoginRequest {
        private String credential;
        public String getCredential() { return credential; }
        public void setCredential(String credential) { this.credential = credential; }
    }

    static class ResetPasswordDirectRequest {
        private String email;
        private String newPassword;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    static class VerifyChangePasswordRequest {
        private String email;
        private String oldPassword;
        private String newPassword;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}