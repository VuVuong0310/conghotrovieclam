package com.jobportal.service;

import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.User;
import com.jobportal.repository.CandidateProfileRepository;
import com.jobportal.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CandidateProfileService {

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private final String UPLOADS_DIR = "uploads/resumes/";
    private final String PHOTOS_DIR = "uploads/photos/";

    @Transactional
    public CandidateProfile updateProfile(Long userId, CandidateProfile incoming) {
        Optional<CandidateProfile> existingOpt = candidateProfileRepository.findById(userId);
        CandidateProfile existing;
        boolean isNew = false;
        if (existingOpt.isPresent()) {
            existing = existingOpt.get();
        } else {
            isNew = true;
            existing = new CandidateProfile();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            existing.setUser(user);
        }
        existing.setFullName(incoming.getFullName());
        existing.setEmail(incoming.getEmail());
        existing.setPhone(incoming.getPhone());
        existing.setAddress(incoming.getAddress());
        existing.setDateOfBirth(incoming.getDateOfBirth());
        existing.setBio(incoming.getBio());
        existing.setLinkedinUrl(incoming.getLinkedinUrl());
        existing.setGithubUrl(incoming.getGithubUrl());
        existing.setPortfolioUrl(incoming.getPortfolioUrl());
        existing.setSkills(incoming.getSkills());
        existing.setSoftSkills(incoming.getSoftSkills());
        existing.setAwards(incoming.getAwards());
        if (isNew) {
            entityManager.persist(existing);
            return existing;
        }
        return candidateProfileRepository.save(existing);
    }

    public Optional<CandidateProfile> getProfile(Long userId) {
        return candidateProfileRepository.findById(userId);
    }

    public String uploadResume(Long userId, MultipartFile file) throws IOException {
        // Validate PDF file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        // Create directory if not exists
        Path uploadPath = Paths.get(UPLOADS_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file
        String filename = userId + "_" + System.currentTimeMillis() + ".pdf";
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        // Update profile with resume path
        Optional<CandidateProfile> profile = candidateProfileRepository.findById(userId);
        if (profile.isPresent()) {
            profile.get().setResumePath(filename);
            candidateProfileRepository.save(profile.get());
        }

        return filename;
    }

    public Path getResumePath(Long userId) {
        Optional<CandidateProfile> profile = candidateProfileRepository.findById(userId);
        if (profile.isPresent() && profile.get().getResumePath() != null) {
            return Paths.get(UPLOADS_DIR).resolve(profile.get().getResumePath());
        }
        return null;
    }

    public String uploadProfileImage(Long userId, MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        Path uploadPath = Paths.get(PHOTOS_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String ext = contentType.contains("png") ? ".png" : ".jpg";
        String filename = userId + "_" + System.currentTimeMillis() + ext;
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        Optional<CandidateProfile> profile = candidateProfileRepository.findById(userId);
        if (profile.isPresent()) {
            profile.get().setProfileImagePath(filename);
            candidateProfileRepository.save(profile.get());
        }
        return filename;
    }

    public Path getProfileImagePath(Long userId) {
        Optional<CandidateProfile> profile = candidateProfileRepository.findById(userId);
        if (profile.isPresent() && profile.get().getProfileImagePath() != null) {
            return Paths.get(PHOTOS_DIR).resolve(profile.get().getProfileImagePath());
        }
        return null;
    }

    /** Escape HTML đặc biệt để chống XSS trong CV */
    private String escHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }

    public String renderCvHtml(Long userId, String template) {
        // Whitelist templates
        if (template == null || !List.of("classic", "modern", "minimal", "elegant", "creative", "executive", "developer", "academic").contains(template)) {
            template = "classic";
        }
        Optional<CandidateProfile> profileOpt = candidateProfileRepository.findById(userId);
        if (profileOpt.isEmpty()) {
            return null;
        }
        CandidateProfile p = profileOpt.get();
        return switch (template) {
            case "modern" -> renderModernTemplate(p, userId);
            case "minimal" -> renderMinimalTemplate(p, userId);
            case "elegant" -> renderElegantTemplate(p, userId);
            case "creative" -> renderCreativeTemplate(p, userId);
            case "executive" -> renderExecutiveTemplate(p, userId);
            case "developer" -> renderDeveloperTemplate(p, userId);
            case "academic" -> renderAcademicTemplate(p, userId);
            default -> renderClassicTemplate(p, userId);
        };
    }

    /** Backward compatibility */
    public String renderCvHtml(Long userId) {
        return renderCvHtml(userId, "classic");
    }

    // ========================= CLASSIC TEMPLATE (original) =========================
    private String renderClassicTemplate(CandidateProfile p, Long userId) {

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:'Segoe UI',Arial,sans-serif;color:#333;background:#e8e8e8;display:flex;justify-content:center;padding:20px}");
        html.append(".cv-container{width:900px;display:flex;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.15)}");
        html.append(".sidebar{width:300px;background:#2c3e50;color:#ecf0f1;padding:30px 20px}");
        html.append(".main{flex:1;padding:30px 35px}");
        html.append(".photo{width:160px;height:160px;border-radius:50%;border:4px solid #3498db;object-fit:cover;display:block;margin:0 auto 20px}");
        html.append(".photo-placeholder{width:160px;height:160px;border-radius:50%;border:4px solid #3498db;background:#34495e;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:60px;color:#3498db}");
        html.append(".sidebar h1{font-size:22px;text-align:center;margin-bottom:5px;color:#fff}");
        html.append(".sidebar .subtitle{text-align:center;color:#3498db;font-size:14px;margin-bottom:20px}");
        html.append(".sidebar h2{font-size:14px;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #3498db;padding-bottom:6px;margin:20px 0 12px;color:#3498db}");
        html.append(".sidebar .info-item{font-size:13px;margin:8px 0;display:flex;align-items:flex-start;gap:8px}");
        html.append(".sidebar .info-item .icon{min-width:16px;color:#3498db}");
        html.append(".sidebar .skill-bar{margin:6px 0}.sidebar .skill-name{font-size:13px;margin-bottom:3px}");
        html.append(".sidebar .bar-bg{height:6px;background:#34495e;border-radius:3px}.sidebar .bar-fill{height:6px;background:#3498db;border-radius:3px;width:80%}");
        html.append(".main h2{font-size:16px;text-transform:uppercase;letter-spacing:2px;color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:6px;margin:25px 0 15px}");
        html.append(".main h2:first-child{margin-top:0}");
        html.append(".exp-block{margin-bottom:18px}.exp-header{display:flex;justify-content:space-between;align-items:baseline}");
        html.append(".exp-title{font-weight:700;font-size:15px;color:#2c3e50}.exp-date{font-size:12px;color:#7f8c8d}");
        html.append(".exp-company{font-size:14px;color:#3498db;font-weight:600;margin:2px 0 5px}");
        html.append(".exp-desc{font-size:13px;line-height:1.6;color:#555}");
        html.append(".exp-desc ul{padding-left:18px;margin-top:4px}.exp-desc li{margin-bottom:3px}");
        html.append(".edu-block{margin-bottom:12px}.edu-header{display:flex;justify-content:space-between}");
        html.append(".edu-school{font-weight:700;font-size:14px}.edu-date{font-size:12px;color:#7f8c8d}");
        html.append(".edu-detail{font-size:13px;color:#555;margin-top:2px}");
        html.append("@media print{body{padding:0;background:#fff}.cv-container{box-shadow:none;width:100%}}");
        html.append("</style></head><body>");

        html.append("<div class='cv-container'>");

        // === SIDEBAR ===
        html.append("<div class='sidebar'>");

        // Photo
        if (p.getProfileImagePath() != null) {
            html.append("<img class='photo' src='/api/profile/").append(userId).append("/photo' alt='Photo'/>");
        } else {
            html.append("<div class='photo-placeholder'>👤</div>");
        }

        // Name & title
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "N/A")).append("</h1>");
        if (p.getBio() != null && !p.getBio().isBlank()) {
            html.append("<div class='subtitle'>").append(escHtml(p.getBio())).append("</div>");
        }

        // Contact info
        html.append("<h2>Thông Tin Liên Hệ</h2>");
        if (p.getEmail() != null && !p.getEmail().isBlank()) html.append("<div class='info-item'><span class='icon'>📧</span> ").append(escHtml(p.getEmail())).append("</div>");
        if (p.getPhone() != null && !p.getPhone().isBlank()) html.append("<div class='info-item'><span class='icon'>📞</span> ").append(escHtml(p.getPhone())).append("</div>");
        if (p.getAddress() != null && !p.getAddress().isBlank()) html.append("<div class='info-item'><span class='icon'>📍</span> ").append(escHtml(p.getAddress())).append("</div>");
        if (p.getDateOfBirth() != null) html.append("<div class='info-item'><span class='icon'>🎂</span> ").append(escHtml(String.valueOf(p.getDateOfBirth()))).append("</div>");
        if (p.getLinkedinUrl() != null && !p.getLinkedinUrl().isBlank()) html.append("<div class='info-item'><span class='icon'>🔗</span> ").append(escHtml(p.getLinkedinUrl())).append("</div>");
        if (p.getGithubUrl() != null && !p.getGithubUrl().isBlank()) html.append("<div class='info-item'><span class='icon'>💻</span> ").append(escHtml(p.getGithubUrl())).append("</div>");
        if (p.getPortfolioUrl() != null && !p.getPortfolioUrl().isBlank()) html.append("<div class='info-item'><span class='icon'>🌐</span> ").append(escHtml(p.getPortfolioUrl())).append("</div>");

        // Skills (technical)
        if (p.getSkills() != null && !p.getSkills().isEmpty()) {
            html.append("<h2>Kỹ Năng Kỹ Thuật</h2>");
            for (String skill : p.getSkills()) {
                html.append("<div class='skill-bar'><div class='skill-name'>").append(escHtml(skill)).append("</div>");
                html.append("<div class='bar-bg'><div class='bar-fill'></div></div></div>");
            }
        }

        // Soft skills
        if (p.getSoftSkills() != null && !p.getSoftSkills().isBlank()) {
            html.append("<h2>Kỹ Năng Mềm</h2>");
            html.append("<div style='font-size:13px;line-height:1.7'>");
            for (String line : p.getSoftSkills().split("\\n")) {
                if (!line.isBlank()) {
                    html.append("<div style='margin:4px 0'>\u2022 ").append(escHtml(line.trim())).append("</div>");
                }
            }
            html.append("</div>");
        }

        // Awards / Danh hiệu
        if (p.getAwards() != null && !p.getAwards().isBlank()) {
            html.append("<h2>Danh Hiệu</h2>");
            html.append("<div style='font-size:13px;line-height:1.7'>");
            for (String line : p.getAwards().split("\\n")) {
                if (!line.isBlank()) {
                    html.append("<div style='margin:4px 0'>\uD83C\uDFC6 ").append(escHtml(line.trim())).append("</div>");
                }
            }
            html.append("</div>");
        }

        html.append("</div>"); // end sidebar

        // === MAIN CONTENT ===
        html.append("<div class='main'>");

        // Experience
        if (p.getExperiences() != null && !p.getExperiences().isEmpty()) {
            html.append("<h2>Kinh Nghiệm Làm Việc</h2>");
            for (var exp : p.getExperiences()) {
                html.append("<div class='exp-block'>");
                html.append("<div class='exp-header'><span class='exp-title'>").append(escHtml(exp.getJobTitle() != null ? exp.getJobTitle() : "")).append("</span>");
                html.append("<span class='exp-date'>").append(escHtml(String.valueOf(exp.getStartDate()))).append(" - ").append(exp.getCurrentJob() != null && exp.getCurrentJob() ? "Hiện tại" : (exp.getEndDate() != null ? escHtml(String.valueOf(exp.getEndDate())) : "")).append("</span></div>");
                html.append("<div class='exp-company'>").append(escHtml(exp.getCompanyName() != null ? exp.getCompanyName() : "")).append("</div>");
                if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                    html.append("<div class='exp-desc'>").append(escHtml(exp.getDescription()).replace("\n", "<br/>")).append("</div>");
                }
                html.append("</div>");
            }
        }

        // Education
        if (p.getEducations() != null && !p.getEducations().isEmpty()) {
            html.append("<h2>Học Vấn</h2>");
            for (var edu : p.getEducations()) {
                html.append("<div class='edu-block'>");
                html.append("<div class='edu-header'><span class='edu-school'>").append(escHtml(edu.getInstitution() != null ? edu.getInstitution() : "")).append("</span>");
                html.append("<span class='edu-date'>").append(escHtml(edu.getStartDate() != null ? String.valueOf(edu.getStartDate()) : "")).append(" - ").append(escHtml(edu.getEndDate() != null ? String.valueOf(edu.getEndDate()) : "Hiện tại")).append("</span></div>");
                if (edu.getDegree() != null) html.append("<div class='edu-detail'>").append(escHtml(edu.getDegree())).append("</div>");
                if (edu.getFieldOfStudy() != null) html.append("<div class='edu-detail'>Chuyên ngành: ").append(escHtml(edu.getFieldOfStudy())).append("</div>");
                if (edu.getGpa() != null) html.append("<div class='edu-detail'>GPA: ").append(escHtml(String.valueOf(edu.getGpa()))).append("</div>");
                html.append("</div>");
            }
        }

        // Projects
        if (p.getProjects() != null && !p.getProjects().isEmpty()) {
            html.append("<h2>Dự Án Tiêu Biểu</h2>");
            for (var proj : p.getProjects()) {
                html.append("<div class='exp-block'>");
                html.append("<div class='exp-title'>").append(escHtml(proj.getProjectName() != null ? proj.getProjectName() : "")).append("</div>");
                if (proj.getTechnology() != null && !proj.getTechnology().isBlank()) {
                    html.append("<div class='exp-company'>Công nghệ: ").append(escHtml(proj.getTechnology())).append("</div>");
                }
                if (proj.getDescription() != null && !proj.getDescription().isBlank()) {
                    html.append("<div class='exp-desc'>").append(escHtml(proj.getDescription()).replace("\n", "<br/>")).append("</div>");
                }
                if (proj.getRole() != null && !proj.getRole().isBlank()) {
                    html.append("<div class='exp-desc' style='margin-top:4px'><strong>Vai trò:</strong> ").append(escHtml(proj.getRole()).replace("\n", "<br/>")).append("</div>");
                }
                html.append("</div>");
            }
        }

        html.append("</div>"); // end main
        html.append("</div>"); // end cv-container
        html.append("</body></html>");
        return html.toString();
    }

    // ========================= SHARED HELPERS =========================
    private void appendContactHtml(StringBuilder html, CandidateProfile p, String iconStyle) {
        if (p.getEmail() != null && !p.getEmail().isBlank()) html.append("<div class='info-item'><span class='icon' style='").append(iconStyle).append("'>📧</span> ").append(escHtml(p.getEmail())).append("</div>");
        if (p.getPhone() != null && !p.getPhone().isBlank()) html.append("<div class='info-item'><span class='icon' style='").append(iconStyle).append("'>📞</span> ").append(escHtml(p.getPhone())).append("</div>");
        if (p.getAddress() != null && !p.getAddress().isBlank()) html.append("<div class='info-item'><span class='icon' style='").append(iconStyle).append("'>📍</span> ").append(escHtml(p.getAddress())).append("</div>");
        if (p.getDateOfBirth() != null) html.append("<div class='info-item'><span class='icon' style='").append(iconStyle).append("'>🎂</span> ").append(escHtml(String.valueOf(p.getDateOfBirth()))).append("</div>");
        if (p.getLinkedinUrl() != null && !p.getLinkedinUrl().isBlank()) html.append("<div class='info-item'><span class='icon' style='").append(iconStyle).append("'>🔗</span> ").append(escHtml(p.getLinkedinUrl())).append("</div>");
        if (p.getGithubUrl() != null && !p.getGithubUrl().isBlank()) html.append("<div class='info-item'><span class='icon' style='").append(iconStyle).append("'>💻</span> ").append(escHtml(p.getGithubUrl())).append("</div>");
        if (p.getPortfolioUrl() != null && !p.getPortfolioUrl().isBlank()) html.append("<div class='info-item'><span class='icon' style='").append(iconStyle).append("'>🌐</span> ").append(escHtml(p.getPortfolioUrl())).append("</div>");
    }

    private void appendExperienceHtml(StringBuilder html, CandidateProfile p) {
        if (p.getExperiences() != null && !p.getExperiences().isEmpty()) {
            html.append("<h2>Kinh Nghiệm Làm Việc</h2>");
            for (var exp : p.getExperiences()) {
                html.append("<div class='exp-block'>");
                html.append("<div class='exp-header'><span class='exp-title'>").append(escHtml(exp.getJobTitle() != null ? exp.getJobTitle() : "")).append("</span>");
                html.append("<span class='exp-date'>").append(escHtml(String.valueOf(exp.getStartDate()))).append(" - ").append(exp.getCurrentJob() != null && exp.getCurrentJob() ? "Hiện tại" : (exp.getEndDate() != null ? escHtml(String.valueOf(exp.getEndDate())) : "")).append("</span></div>");
                html.append("<div class='exp-company'>").append(escHtml(exp.getCompanyName() != null ? exp.getCompanyName() : "")).append("</div>");
                if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                    html.append("<div class='exp-desc'>").append(escHtml(exp.getDescription()).replace("\n", "<br/>")).append("</div>");
                }
                html.append("</div>");
            }
        }
    }

    private void appendEducationHtml(StringBuilder html, CandidateProfile p) {
        if (p.getEducations() != null && !p.getEducations().isEmpty()) {
            html.append("<h2>Học Vấn</h2>");
            for (var edu : p.getEducations()) {
                html.append("<div class='edu-block'>");
                html.append("<div class='edu-header'><span class='edu-school'>").append(escHtml(edu.getInstitution() != null ? edu.getInstitution() : "")).append("</span>");
                html.append("<span class='edu-date'>").append(escHtml(edu.getStartDate() != null ? String.valueOf(edu.getStartDate()) : "")).append(" - ").append(escHtml(edu.getEndDate() != null ? String.valueOf(edu.getEndDate()) : "Hiện tại")).append("</span></div>");
                if (edu.getDegree() != null) html.append("<div class='edu-detail'>").append(escHtml(edu.getDegree())).append("</div>");
                if (edu.getFieldOfStudy() != null) html.append("<div class='edu-detail'>Chuyên ngành: ").append(escHtml(edu.getFieldOfStudy())).append("</div>");
                if (edu.getGpa() != null) html.append("<div class='edu-detail'>GPA: ").append(escHtml(String.valueOf(edu.getGpa()))).append("</div>");
                html.append("</div>");
            }
        }
    }

    private void appendProjectsHtml(StringBuilder html, CandidateProfile p) {
        if (p.getProjects() != null && !p.getProjects().isEmpty()) {
            html.append("<h2>Dự Án Tiêu Biểu</h2>");
            for (var proj : p.getProjects()) {
                html.append("<div class='exp-block'>");
                html.append("<div class='exp-title'>").append(escHtml(proj.getProjectName() != null ? proj.getProjectName() : "")).append("</div>");
                if (proj.getTechnology() != null && !proj.getTechnology().isBlank()) {
                    html.append("<div class='exp-company'>Công nghệ: ").append(escHtml(proj.getTechnology())).append("</div>");
                }
                if (proj.getDescription() != null && !proj.getDescription().isBlank()) {
                    html.append("<div class='exp-desc'>").append(escHtml(proj.getDescription()).replace("\n", "<br/>")).append("</div>");
                }
                if (proj.getRole() != null && !proj.getRole().isBlank()) {
                    html.append("<div class='exp-desc' style='margin-top:4px'><strong>Vai trò:</strong> ").append(escHtml(proj.getRole()).replace("\n", "<br/>")).append("</div>");
                }
                html.append("</div>");
            }
        }
    }

    private void appendSkillsSidebar(StringBuilder html, CandidateProfile p, String barColor) {
        if (p.getSkills() != null && !p.getSkills().isEmpty()) {
            html.append("<h2>Kỹ Năng Kỹ Thuật</h2>");
            for (String skill : p.getSkills()) {
                html.append("<div class='skill-bar'><div class='skill-name'>").append(escHtml(skill)).append("</div>");
                html.append("<div class='bar-bg'><div class='bar-fill' style='background:").append(barColor).append("'></div></div></div>");
            }
        }
    }

    private void appendSoftSkills(StringBuilder html, CandidateProfile p) {
        if (p.getSoftSkills() != null && !p.getSoftSkills().isBlank()) {
            html.append("<h2>Kỹ Năng Mềm</h2>");
            html.append("<div style='font-size:13px;line-height:1.7'>");
            for (String line : p.getSoftSkills().split("\\n")) {
                if (!line.isBlank()) html.append("<div style='margin:4px 0'>\u2022 ").append(escHtml(line.trim())).append("</div>");
            }
            html.append("</div>");
        }
    }

    private void appendAwards(StringBuilder html, CandidateProfile p) {
        if (p.getAwards() != null && !p.getAwards().isBlank()) {
            html.append("<h2>Danh Hiệu</h2>");
            html.append("<div style='font-size:13px;line-height:1.7'>");
            for (String line : p.getAwards().split("\\n")) {
                if (!line.isBlank()) html.append("<div style='margin:4px 0'>🏆 ").append(escHtml(line.trim())).append("</div>");
            }
            html.append("</div>");
        }
    }

    // ========================= MODERN TEMPLATE =========================
    private String renderModernTemplate(CandidateProfile p, Long userId) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:'Inter','Segoe UI',sans-serif;color:#1a1a1a;background:#f0f0f0;display:flex;justify-content:center;padding:20px}");
        html.append(".cv-container{width:900px;background:#fff;box-shadow:0 0 30px rgba(0,0,0,.1);border-radius:8px;overflow:hidden}");
        html.append(".header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:40px;display:flex;align-items:center;gap:30px}");
        html.append(".photo{width:130px;height:130px;border-radius:50%;border:4px solid rgba(255,255,255,.4);object-fit:cover}");
        html.append(".photo-placeholder{width:130px;height:130px;border-radius:50%;border:4px solid rgba(255,255,255,.4);background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:50px}");
        html.append(".header-info h1{font-size:28px;font-weight:700;margin-bottom:6px}");
        html.append(".header-info .subtitle{font-size:15px;opacity:.9;margin-bottom:12px}");
        html.append(".header-info .contact-row{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;opacity:.85}");
        html.append(".header-info .contact-row span{display:flex;align-items:center;gap:4px}");
        html.append(".content{display:flex;padding:0}");
        html.append(".main{flex:1;padding:30px 35px}");
        html.append(".sidebar{width:280px;background:#f8f7ff;padding:30px 20px;border-left:1px solid #e8e5f5}");
        html.append(".info-item{font-size:13px;margin:8px 0;display:flex;align-items:flex-start;gap:8px}");
        html.append(".info-item .icon{min-width:16px;color:#764ba2}");
        html.append("h2{font-size:15px;text-transform:uppercase;letter-spacing:2px;color:#764ba2;border-bottom:2px solid #764ba2;padding-bottom:6px;margin:22px 0 14px}");
        html.append("h2:first-child{margin-top:0}");
        html.append(".skill-bar{margin:6px 0}.skill-name{font-size:13px;margin-bottom:3px}");
        html.append(".bar-bg{height:6px;background:#e8e5f5;border-radius:3px}.bar-fill{height:6px;background:#764ba2;border-radius:3px;width:80%}");
        html.append(".exp-block{margin-bottom:18px}.exp-header{display:flex;justify-content:space-between;align-items:baseline}");
        html.append(".exp-title{font-weight:700;font-size:15px;color:#1a1a1a}.exp-date{font-size:12px;color:#888;background:#f0eeff;padding:2px 10px;border-radius:10px}");
        html.append(".exp-company{font-size:14px;color:#764ba2;font-weight:600;margin:2px 0 5px}");
        html.append(".exp-desc{font-size:13px;line-height:1.6;color:#555}");
        html.append(".edu-block{margin-bottom:12px}.edu-header{display:flex;justify-content:space-between}");
        html.append(".edu-school{font-weight:700;font-size:14px}.edu-date{font-size:12px;color:#888}");
        html.append(".edu-detail{font-size:13px;color:#555;margin-top:2px}");
        html.append("@media print{body{padding:0;background:#fff}.cv-container{box-shadow:none;border-radius:0}}");
        html.append("</style></head><body>");

        html.append("<div class='cv-container'>");

        // Header with gradient
        html.append("<div class='header'>");
        if (p.getProfileImagePath() != null) {
            html.append("<img class='photo' src='/api/profile/").append(userId).append("/photo' alt='Photo'/>");
        } else {
            html.append("<div class='photo-placeholder'>👤</div>");
        }
        html.append("<div class='header-info'>");
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "N/A")).append("</h1>");
        if (p.getBio() != null && !p.getBio().isBlank()) html.append("<div class='subtitle'>").append(escHtml(p.getBio())).append("</div>");
        html.append("<div class='contact-row'>");
        if (p.getEmail() != null) html.append("<span>📧 ").append(escHtml(p.getEmail())).append("</span>");
        if (p.getPhone() != null) html.append("<span>📞 ").append(escHtml(p.getPhone())).append("</span>");
        if (p.getAddress() != null) html.append("<span>📍 ").append(escHtml(p.getAddress())).append("</span>");
        html.append("</div></div></div>");

        // Content = main + sidebar
        html.append("<div class='content'>");
        html.append("<div class='main'>");
        appendExperienceHtml(html, p);
        appendEducationHtml(html, p);
        appendProjectsHtml(html, p);
        html.append("</div>");

        // Sidebar right
        html.append("<div class='sidebar'>");
        appendSkillsSidebar(html, p, "#764ba2");
        appendSoftSkills(html, p);
        appendAwards(html, p);
        html.append("</div>");

        html.append("</div>"); // content
        html.append("</div>"); // cv-container
        html.append("</body></html>");
        return html.toString();
    }

    // ========================= MINIMAL TEMPLATE =========================
    private String renderMinimalTemplate(CandidateProfile p, Long userId) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:'Georgia','Times New Roman',serif;color:#333;background:#eee;display:flex;justify-content:center;padding:20px}");
        html.append(".cv-container{width:800px;background:#fff;padding:50px 60px;box-shadow:0 0 20px rgba(0,0,0,.08)}");
        html.append(".header{text-align:center;margin-bottom:30px;padding-bottom:25px;border-bottom:1px solid #ddd}");
        html.append(".photo{width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:15px}");
        html.append(".photo-placeholder{width:100px;height:100px;border-radius:50%;background:#f5f5f5;display:inline-flex;align-items:center;justify-content:center;margin-bottom:15px;font-size:40px}");
        html.append("h1{font-size:28px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:#222;margin-bottom:8px}");
        html.append(".subtitle{font-size:14px;color:#777;letter-spacing:1px;margin-bottom:12px}");
        html.append(".contact-line{font-size:12px;color:#999;display:flex;justify-content:center;flex-wrap:wrap;gap:15px}");
        html.append(".contact-line span{display:flex;align-items:center;gap:4px}");
        html.append("h2{font-size:13px;text-transform:uppercase;letter-spacing:3px;color:#222;margin:28px 0 14px;padding-bottom:8px;border-bottom:1px solid #222}");
        html.append(".exp-block{margin-bottom:16px}.exp-header{display:flex;justify-content:space-between;align-items:baseline}");
        html.append(".exp-title{font-weight:700;font-size:14px;color:#222}.exp-date{font-size:12px;color:#999;font-style:italic}");
        html.append(".exp-company{font-size:13px;color:#555;margin:2px 0 4px}");
        html.append(".exp-desc{font-size:13px;line-height:1.7;color:#555}");
        html.append(".edu-block{margin-bottom:12px}.edu-header{display:flex;justify-content:space-between}");
        html.append(".edu-school{font-weight:700;font-size:14px}.edu-date{font-size:12px;color:#999;font-style:italic}");
        html.append(".edu-detail{font-size:13px;color:#555;margin-top:2px}");
        html.append(".skills-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}");
        html.append(".skill-tag{font-size:12px;padding:4px 14px;border:1px solid #ccc;border-radius:20px;color:#444}");
        html.append(".info-item{font-size:13px;margin:6px 0;display:flex;align-items:flex-start;gap:8px}");
        html.append(".info-item .icon{min-width:16px;color:#555}");
        html.append("@media print{body{padding:0;background:#fff}.cv-container{box-shadow:none;padding:30px 40px}}");
        html.append("</style></head><body>");

        html.append("<div class='cv-container'>");

        // Centered header
        html.append("<div class='header'>");
        if (p.getProfileImagePath() != null) {
            html.append("<img class='photo' src='/api/profile/").append(userId).append("/photo' alt='Photo'/><br/>");
        }
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "N/A")).append("</h1>");
        if (p.getBio() != null && !p.getBio().isBlank()) html.append("<div class='subtitle'>").append(escHtml(p.getBio())).append("</div>");
        html.append("<div class='contact-line'>");
        if (p.getEmail() != null) html.append("<span>📧 ").append(escHtml(p.getEmail())).append("</span>");
        if (p.getPhone() != null) html.append("<span>📞 ").append(escHtml(p.getPhone())).append("</span>");
        if (p.getAddress() != null) html.append("<span>📍 ").append(escHtml(p.getAddress())).append("</span>");
        html.append("</div></div>");

        // Skills as tags
        if (p.getSkills() != null && !p.getSkills().isEmpty()) {
            html.append("<h2>Kỹ Năng</h2><div class='skills-grid'>");
            for (String skill : p.getSkills()) {
                html.append("<span class='skill-tag'>").append(escHtml(skill)).append("</span>");
            }
            html.append("</div>");
        }

        appendExperienceHtml(html, p);
        appendEducationHtml(html, p);
        appendProjectsHtml(html, p);

        // Soft skills & Awards inline
        if (p.getSoftSkills() != null && !p.getSoftSkills().isBlank()) {
            html.append("<h2>Kỹ Năng Mềm</h2><div style='font-size:13px;line-height:1.7'>");
            for (String line : p.getSoftSkills().split("\\n")) {
                if (!line.isBlank()) html.append("<div style='margin:4px 0'>\u2022 ").append(escHtml(line.trim())).append("</div>");
            }
            html.append("</div>");
        }
        if (p.getAwards() != null && !p.getAwards().isBlank()) {
            html.append("<h2>Danh Hiệu</h2><div style='font-size:13px;line-height:1.7'>");
            for (String line : p.getAwards().split("\\n")) {
                if (!line.isBlank()) html.append("<div style='margin:4px 0'>🏆 ").append(escHtml(line.trim())).append("</div>");
            }
            html.append("</div>");
        }

        html.append("</div>");
        html.append("</body></html>");
        return html.toString();
    }

    // ========================= ELEGANT TEMPLATE =========================
    private String renderElegantTemplate(CandidateProfile p, Long userId) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:'Segoe UI',Arial,sans-serif;color:#2d3436;background:#e8e8e8;display:flex;justify-content:center;padding:20px}");
        html.append(".cv-container{width:900px;display:flex;background:#fff;box-shadow:0 0 25px rgba(0,0,0,.12)}");
        html.append(".sidebar{width:300px;background:linear-gradient(180deg,#0c2340 0%,#1a3a5c 100%);color:#e0e0e0;padding:30px 20px}");
        html.append(".main{flex:1;padding:30px 35px;background:#fff}");
        html.append(".photo{width:160px;height:160px;border-radius:12px;border:3px solid rgba(255,255,255,.3);object-fit:cover;display:block;margin:0 auto 20px}");
        html.append(".photo-placeholder{width:160px;height:160px;border-radius:12px;border:3px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:60px}");
        html.append(".sidebar h1{font-size:22px;text-align:center;margin-bottom:5px;color:#fff;font-weight:600}");
        html.append(".sidebar .subtitle{text-align:center;color:#e6a817;font-size:14px;margin-bottom:20px;font-style:italic}");
        html.append(".sidebar h2{font-size:13px;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #e6a817;padding-bottom:6px;margin:22px 0 12px;color:#e6a817}");
        html.append(".sidebar .info-item{font-size:13px;margin:8px 0;display:flex;align-items:flex-start;gap:8px}");
        html.append(".sidebar .info-item .icon{min-width:16px;color:#e6a817}");
        html.append(".skill-bar{margin:6px 0}.skill-name{font-size:13px;margin-bottom:3px;color:#ccc}");
        html.append(".bar-bg{height:5px;background:rgba(255,255,255,.15);border-radius:3px}.bar-fill{height:5px;background:linear-gradient(90deg,#e6a817,#f0c850);border-radius:3px;width:80%}");
        html.append(".main h2{font-size:15px;text-transform:uppercase;letter-spacing:2px;color:#0c2340;padding-bottom:8px;margin:25px 0 15px;border-bottom:2px solid #e6a817;display:flex;align-items:center;gap:8px}");
        html.append(".main h2:first-child{margin-top:0}");
        html.append(".exp-block{margin-bottom:18px;padding-left:15px;border-left:3px solid #e6a817}");
        html.append(".exp-header{display:flex;justify-content:space-between;align-items:baseline}");
        html.append(".exp-title{font-weight:700;font-size:15px;color:#0c2340}.exp-date{font-size:12px;color:#888}");
        html.append(".exp-company{font-size:14px;color:#e6a817;font-weight:600;margin:2px 0 5px}");
        html.append(".exp-desc{font-size:13px;line-height:1.6;color:#555}");
        html.append(".edu-block{margin-bottom:14px;padding-left:15px;border-left:3px solid #e6a817}");
        html.append(".edu-header{display:flex;justify-content:space-between}");
        html.append(".edu-school{font-weight:700;font-size:14px;color:#0c2340}.edu-date{font-size:12px;color:#888}");
        html.append(".edu-detail{font-size:13px;color:#555;margin-top:2px}");
        html.append("@media print{body{padding:0;background:#fff}.cv-container{box-shadow:none;width:100%}}");
        html.append("</style></head><body>");

        html.append("<div class='cv-container'>");

        // Sidebar
        html.append("<div class='sidebar'>");
        if (p.getProfileImagePath() != null) {
            html.append("<img class='photo' src='/api/profile/").append(userId).append("/photo' alt='Photo'/>");
        } else {
            html.append("<div class='photo-placeholder'>👤</div>");
        }
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "N/A")).append("</h1>");
        if (p.getBio() != null && !p.getBio().isBlank()) html.append("<div class='subtitle'>").append(escHtml(p.getBio())).append("</div>");

        html.append("<h2>Liên Hệ</h2>");
        appendContactHtml(html, p, "color:#e6a817");

        appendSkillsSidebar(html, p, "linear-gradient(90deg,#e6a817,#f0c850)");
        appendSoftSkills(html, p);
        appendAwards(html, p);
        html.append("</div>");

        // Main
        html.append("<div class='main'>");
        appendExperienceHtml(html, p);
        appendEducationHtml(html, p);
        appendProjectsHtml(html, p);
        html.append("</div>");

        html.append("</div>");
        html.append("</body></html>");
        return html.toString();
    }

    // ========================= CREATIVE TEMPLATE =========================
    private String renderCreativeTemplate(CandidateProfile p, Long userId) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:'Segoe UI',sans-serif;background:#f0f0f0;display:flex;justify-content:center;padding:20px}");
        html.append(".cv{width:900px;background:#fff;overflow:hidden;box-shadow:0 0 30px rgba(0,0,0,.1)}");
        html.append(".header{background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff;padding:40px;display:flex;align-items:center;gap:30px}");
        html.append(".photo{width:140px;height:140px;border-radius:20px;border:4px solid rgba(255,255,255,.5);object-fit:cover}");
        html.append(".photo-placeholder{width:140px;height:140px;border-radius:20px;border:4px solid rgba(255,255,255,.5);background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:50px}");
        html.append(".header-info h1{font-size:28px;margin-bottom:5px}.header-info .title{font-size:16px;opacity:.9}");
        html.append(".header-info .contact{margin-top:10px;font-size:13px;opacity:.85}");
        html.append(".body{display:grid;grid-template-columns:1fr 1fr;gap:0}");
        html.append(".col{padding:25px 30px}");
        html.append(".col:first-child{border-right:1px solid #eee}");
        html.append("h2{font-size:16px;color:#e74c3c;text-transform:uppercase;letter-spacing:2px;margin:20px 0 12px;padding-bottom:6px;border-bottom:2px solid #e74c3c}");
        html.append("h2:first-child{margin-top:0}");
        html.append(".item{margin-bottom:15px}.item-title{font-weight:700;font-size:14px;color:#333}");
        html.append(".item-sub{font-size:13px;color:#e74c3c;font-weight:600}.item-date{font-size:12px;color:#999}");
        html.append(".item-desc{font-size:13px;color:#555;line-height:1.6;margin-top:4px}");
        html.append(".skill-tag{display:inline-block;background:#fde8e7;color:#e74c3c;padding:4px 12px;border-radius:15px;font-size:12px;margin:3px 4px 3px 0}");
        html.append(".soft-tag{display:inline-block;background:#fff3e0;color:#e65100;padding:4px 12px;border-radius:15px;font-size:12px;margin:3px 4px 3px 0}");
        html.append("</style></head><body>");
        html.append("<div class='cv'>");

        // Header
        html.append("<div class='header'>");
        appendPhotoHtml(html, p, userId, "photo", "photo-placeholder");
        html.append("<div class='header-info'>");
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "")).append("</h1>");
        if (p.getBio() != null) html.append("<div class='title'>").append(escHtml(p.getBio())).append("</div>");
        html.append("<div class='contact'>");
        if (p.getEmail() != null) html.append("&#9993; ").append(escHtml(p.getEmail())).append(" &nbsp; ");
        if (p.getPhone() != null) html.append("&#9742; ").append(escHtml(p.getPhone())).append(" &nbsp; ");
        if (p.getAddress() != null) html.append("&#9873; ").append(escHtml(p.getAddress()));
        html.append("</div></div></div>");

        // Body
        html.append("<div class='body'>");

        // Left column
        html.append("<div class='col'>");
        appendExperienceHtml(html, p);
        appendProjectsHtml(html, p);
        html.append("</div>");

        // Right column
        html.append("<div class='col'>");
        appendEducationHtml(html, p);
        if (p.getSkills() != null && !p.getSkills().isEmpty()) {
            html.append("<h2>K&#7929; n&#259;ng</h2>");
            for (String s : p.getSkills()) {
                html.append("<span class='skill-tag'>").append(escHtml(s.trim())).append("</span>");
            }
        }
        if (p.getSoftSkills() != null && !p.getSoftSkills().isEmpty()) {
            html.append("<h2>K&#7929; n&#259;ng m&#7873;m</h2>");
            for (String s : p.getSoftSkills().split(",")) {
                html.append("<span class='soft-tag'>").append(escHtml(s.trim())).append("</span>");
            }
        }
        appendAwards(html, p);
        html.append("</div>");

        html.append("</div></div></body></html>");
        return html.toString();
    }

    // ========================= EXECUTIVE TEMPLATE =========================
    private String renderExecutiveTemplate(CandidateProfile p, Long userId) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:Georgia,'Times New Roman',serif;background:#f5f0eb;display:flex;justify-content:center;padding:20px}");
        html.append(".cv{width:900px;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.1)}");
        html.append(".header{text-align:center;padding:50px 40px 30px;border-bottom:3px double #8b7355}");
        html.append(".photo{width:120px;height:120px;border-radius:50%;border:3px solid #8b7355;object-fit:cover;display:block;margin:0 auto 15px}");
        html.append(".photo-placeholder{width:120px;height:120px;border-radius:50%;border:3px solid #8b7355;background:#f5f0eb;display:flex;align-items:center;justify-content:center;margin:0 auto 15px;font-size:40px;color:#8b7355}");
        html.append(".header h1{font-size:32px;color:#333;font-weight:400;letter-spacing:3px;text-transform:uppercase}");
        html.append(".header .divider{width:60px;height:2px;background:#8b7355;margin:10px auto}");
        html.append(".header .contact{font-size:13px;color:#666;margin-top:8px}");
        html.append(".content{padding:30px 50px 40px}");
        html.append("h2{font-size:15px;text-transform:uppercase;letter-spacing:3px;color:#8b7355;margin:30px 0 15px;text-align:center}");
        html.append("h2:first-child{margin-top:0}");
        html.append(".sep{width:100%;height:1px;background:#ddd;margin:5px 0 15px}");
        html.append(".item{margin-bottom:18px}.item-title{font-weight:700;font-size:15px;color:#333}");
        html.append(".item-sub{font-size:14px;color:#8b7355;font-style:italic}.item-date{font-size:12px;color:#999}");
        html.append(".item-desc{font-size:13px;color:#555;line-height:1.8;margin-top:5px}");
        html.append(".skills-grid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}");
        html.append(".skill-pill{border:1px solid #8b7355;color:#8b7355;padding:5px 16px;border-radius:3px;font-size:12px;font-family:'Segoe UI',sans-serif}");
        html.append("</style></head><body>");
        html.append("<div class='cv'>");

        // Header
        html.append("<div class='header'>");
        appendPhotoHtml(html, p, userId, "photo", "photo-placeholder");
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "")).append("</h1>");
        html.append("<div class='divider'></div>");
        if (p.getBio() != null) html.append("<div style='font-style:italic;color:#666;font-size:14px'>").append(escHtml(p.getBio())).append("</div>");
        html.append("<div class='contact'>");
        if (p.getEmail() != null) html.append(escHtml(p.getEmail()));
        if (p.getPhone() != null) html.append(" &bull; ").append(escHtml(p.getPhone()));
        if (p.getAddress() != null) html.append(" &bull; ").append(escHtml(p.getAddress()));
        html.append("</div></div>");

        // Content
        html.append("<div class='content'>");
        appendExperienceHtml(html, p);
        html.append("<div class='sep'></div>");
        appendEducationHtml(html, p);
        html.append("<div class='sep'></div>");
        appendProjectsHtml(html, p);
        if (p.getSkills() != null && !p.getSkills().isEmpty()) {
            html.append("<div class='sep'></div>");
            html.append("<h2>Chuy&#234;n m&#244;n</h2>");
            html.append("<div class='skills-grid'>");
            for (String s : p.getSkills()) {
                html.append("<span class='skill-pill'>").append(escHtml(s.trim())).append("</span>");
            }
            html.append("</div>");
        }
        appendAwards(html, p);
        html.append("</div></div></body></html>");
        return html.toString();
    }

    // ========================= DEVELOPER TEMPLATE =========================
    private String renderDeveloperTemplate(CandidateProfile p, Long userId) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:'Consolas','Courier New',monospace;background:#1e1e1e;display:flex;justify-content:center;padding:20px}");
        html.append(".cv{width:900px;background:#252526;color:#d4d4d4;box-shadow:0 0 30px rgba(0,0,0,.5)}");
        html.append(".topbar{background:#007acc;padding:8px 20px;font-size:12px;color:#fff;display:flex;justify-content:space-between}");
        html.append(".header{padding:30px;display:flex;gap:25px;border-bottom:1px solid #3c3c3c}");
        html.append(".photo{width:100px;height:100px;border-radius:8px;border:2px solid #007acc;object-fit:cover}");
        html.append(".photo-placeholder{width:100px;height:100px;border-radius:8px;border:2px solid #007acc;background:#1e1e1e;display:flex;align-items:center;justify-content:center;font-size:36px;color:#007acc}");
        html.append(".header-info h1{font-size:24px;color:#569cd6}.header-info .bio{color:#6a9955;font-size:13px;margin:5px 0}");
        html.append(".header-info .contact{font-size:12px;color:#9cdcfe}");
        html.append(".header-info .contact a{color:#9cdcfe;text-decoration:none}");
        html.append(".body{display:flex}.sidebar{width:280px;background:#1e1e1e;padding:20px;border-right:1px solid #3c3c3c}");
        html.append(".main{flex:1;padding:20px 25px}");
        html.append("h2{font-size:14px;color:#c586c0;text-transform:uppercase;letter-spacing:1px;margin:20px 0 10px;font-family:'Segoe UI',sans-serif}");
        html.append("h2:first-child{margin-top:0}");
        html.append(".comment{color:#6a9955;font-size:12px;margin-bottom:8px}");
        html.append(".item{margin-bottom:14px;padding-left:12px;border-left:2px solid #3c3c3c}");
        html.append(".item-title{font-weight:700;font-size:14px;color:#4ec9b0}");
        html.append(".item-sub{font-size:13px;color:#dcdcaa}.item-date{font-size:11px;color:#808080}");
        html.append(".item-desc{font-size:12px;color:#d4d4d4;line-height:1.6;margin-top:4px}");
        html.append(".skill-chip{display:inline-block;background:#264f78;color:#9cdcfe;padding:3px 10px;border-radius:3px;font-size:11px;margin:2px 3px 2px 0}");
        html.append(".soft-chip{display:inline-block;background:#4d3319;color:#ce9178;padding:3px 10px;border-radius:3px;font-size:11px;margin:2px 3px 2px 0}");
        html.append("</style></head><body>");
        html.append("<div class='cv'>");

        // Top bar
        html.append("<div class='topbar'><span>&#9654; ").append(escHtml(p.getFullName() != null ? p.getFullName() : "Developer")).append(" - CV</span><span>UTF-8 &nbsp; LF</span></div>");

        // Header
        html.append("<div class='header'>");
        appendPhotoHtml(html, p, userId, "photo", "photo-placeholder");
        html.append("<div class='header-info'>");
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "")).append("</h1>");
        if (p.getBio() != null) html.append("<div class='bio'>// ").append(escHtml(p.getBio())).append("</div>");
        html.append("<div class='contact'>");
        if (p.getEmail() != null) html.append("email: ").append(escHtml(p.getEmail())).append(" &nbsp;|&nbsp; ");
        if (p.getPhone() != null) html.append("tel: ").append(escHtml(p.getPhone())).append(" &nbsp;|&nbsp; ");
        if (p.getGithubUrl() != null) html.append("github: ").append(escHtml(p.getGithubUrl()));
        else if (p.getAddress() != null) html.append("loc: ").append(escHtml(p.getAddress()));
        html.append("</div></div></div>");

        // Body
        html.append("<div class='body'>");

        // Sidebar
        html.append("<div class='sidebar'>");
        if (p.getSkills() != null && !p.getSkills().isEmpty()) {
            html.append("<h2>// Tech Stack</h2>");
            for (String s : p.getSkills()) {
                html.append("<span class='skill-chip'>").append(escHtml(s.trim())).append("</span>");
            }
        }
        if (p.getSoftSkills() != null && !p.getSoftSkills().isEmpty()) {
            html.append("<h2>// Soft Skills</h2>");
            for (String s : p.getSoftSkills().split(",")) {
                html.append("<span class='soft-chip'>").append(escHtml(s.trim())).append("</span>");
            }
        }
        appendAwards(html, p);
        html.append("</div>");

        // Main
        html.append("<div class='main'>");
        html.append("<div class='comment'>/* Work Experience */</div>");
        appendExperienceHtml(html, p);
        html.append("<div class='comment'>/* Education */</div>");
        appendEducationHtml(html, p);
        html.append("<div class='comment'>/* Projects */</div>");
        appendProjectsHtml(html, p);
        html.append("</div>");

        html.append("</div></div></body></html>");
        return html.toString();
    }

    // ========================= ACADEMIC TEMPLATE =========================
    private String renderAcademicTemplate(CandidateProfile p, Long userId) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>");
        html.append("*{margin:0;padding:0;box-sizing:border-box}");
        html.append("body{font-family:'Palatino Linotype','Book Antiqua',Palatino,serif;background:#f9f6f1;display:flex;justify-content:center;padding:20px}");
        html.append(".cv{width:800px;background:#fff;padding:50px 60px;box-shadow:0 0 15px rgba(0,0,0,.08)}");
        html.append(".header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #2c5282}");
        html.append(".photo{width:100px;height:100px;border-radius:50%;border:2px solid #2c5282;object-fit:cover;display:block;margin:0 auto 12px}");
        html.append(".photo-placeholder{width:100px;height:100px;border-radius:50%;border:2px solid #2c5282;background:#ebf0f7;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:36px;color:#2c5282}");
        html.append(".header h1{font-size:28px;color:#1a202c;font-weight:400;letter-spacing:1px}");
        html.append(".header .subtitle{font-size:14px;color:#4a5568;font-style:italic;margin:5px 0}");
        html.append(".header .contact{font-size:12px;color:#718096;margin-top:8px}");
        html.append(".header .contact a{color:#2c5282;text-decoration:none}");
        html.append("h2{font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#2c5282;margin:25px 0 10px;padding-bottom:4px;border-bottom:1px solid #cbd5e0}");
        html.append("h2:first-child{margin-top:0}");
        html.append(".item{margin-bottom:14px}.item-title{font-weight:700;font-size:14px;color:#1a202c}");
        html.append(".item-sub{font-size:13px;color:#2c5282}.item-date{font-size:12px;color:#a0aec0;font-style:italic}");
        html.append(".item-desc{font-size:13px;color:#4a5568;line-height:1.8;margin-top:4px;text-align:justify}");
        html.append(".two-col{display:grid;grid-template-columns:1fr 1fr;gap:15px 30px}");
        html.append(".skill-item{font-size:13px;color:#4a5568;padding:3px 0;border-bottom:1px dotted #e2e8f0}");
        html.append("</style></head><body>");
        html.append("<div class='cv'>");

        // Header
        html.append("<div class='header'>");
        appendPhotoHtml(html, p, userId, "photo", "photo-placeholder");
        html.append("<h1>").append(escHtml(p.getFullName() != null ? p.getFullName() : "")).append("</h1>");
        if (p.getBio() != null) html.append("<div class='subtitle'>").append(escHtml(p.getBio())).append("</div>");
        html.append("<div class='contact'>");
        if (p.getEmail() != null) html.append(escHtml(p.getEmail()));
        if (p.getPhone() != null) html.append(" | ").append(escHtml(p.getPhone()));
        if (p.getAddress() != null) html.append(" | ").append(escHtml(p.getAddress()));
        if (p.getLinkedinUrl() != null) html.append("<br><a href='").append(escHtml(p.getLinkedinUrl())).append("'>LinkedIn</a>");
        if (p.getGithubUrl() != null) html.append(" | <a href='").append(escHtml(p.getGithubUrl())).append("'>GitHub</a>");
        html.append("</div></div>");

        // Education first (academic focus)
        appendEducationHtml(html, p);
        appendExperienceHtml(html, p);
        appendProjectsHtml(html, p);

        if (p.getSkills() != null && !p.getSkills().isEmpty()) {
            html.append("<h2>K&#7929; n&#259;ng chuy&#234;n m&#244;n</h2>");
            html.append("<div class='two-col'>");
            for (String s : p.getSkills()) {
                html.append("<div class='skill-item'>&#8226; ").append(escHtml(s.trim())).append("</div>");
            }
            html.append("</div>");
        }
        appendAwards(html, p);

        html.append("</div></body></html>");
        return html.toString();
    }

    // Helper: render photo or placeholder
    private void appendPhotoHtml(StringBuilder html, CandidateProfile p, Long userId, String photoClass, String placeholderClass) {
        if (p.getProfileImagePath() != null) {
            html.append("<img class='").append(photoClass).append("' src='/api/profile/").append(userId).append("/photo' alt='Photo'/>");
        } else {
            String initial = (p.getFullName() != null && !p.getFullName().isEmpty()) ? String.valueOf(p.getFullName().charAt(0)).toUpperCase() : "?";
            html.append("<div class='").append(placeholderClass).append("'>").append(initial).append("</div>");
        }
    }

}