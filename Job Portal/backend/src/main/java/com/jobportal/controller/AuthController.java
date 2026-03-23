package com.jobportal.controller;

import com.jobportal.entity.Role;
import com.jobportal.entity.User;
import com.jobportal.repository.RoleRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

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
                Role role = roleRepository.findByName(r)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(role);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
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
}