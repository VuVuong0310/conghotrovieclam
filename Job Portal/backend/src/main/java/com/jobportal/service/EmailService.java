package com.jobportal.service;

import com.jobportal.entity.CandidateProfile;
import com.jobportal.entity.JobPost;
import com.jobportal.entity.User;
import com.jobportal.repository.CandidateProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    private String getCandidateEmail(User candidate) {
        return candidateProfileRepository.findById(candidate.getId())
                .map(CandidateProfile::getEmail)
                .filter(e -> e != null && !e.isBlank())
                .orElse(candidate.getUsername());
    }

    private String getCandidateName(User candidate) {
        return candidateProfileRepository.findById(candidate.getId())
                .map(CandidateProfile::getFullName)
                .filter(n -> n != null && !n.isBlank())
                .orElse(candidate.getUsername());
    }

    public void sendApplicationConfirmation(User candidate, JobPost job) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(getCandidateEmail(candidate));
            helper.setSubject("Xác nhận ứng tuyển - " + job.getTitle());
            
            String htmlContent = buildApplicationConfirmationEmail(getCandidateName(candidate), job);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send application confirmation email: {}", e.getMessage());
        }
    }

    public void sendInterviewInvitation(User candidate, JobPost job, String interviewDetails) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(getCandidateEmail(candidate));
            helper.setSubject("Mời phỏng vấn - " + job.getTitle());
            
            String htmlContent = buildInterviewInvitationEmail(getCandidateName(candidate), job, interviewDetails);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send interview invitation email: {}", e.getMessage());
        }
    }

    public void sendRejectionNotification(User candidate, JobPost job) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(getCandidateEmail(candidate));
            helper.setSubject("Kết quả ứng tuyển - " + job.getTitle());
            
            String htmlContent = buildRejectionEmail(getCandidateName(candidate), job);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send rejection email: {}", e.getMessage());
        }
    }

    public void sendAcceptanceNotification(User candidate, JobPost job) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(getCandidateEmail(candidate));
            helper.setSubject("Chúc mừng! Bạn đã được chấp nhận - " + job.getTitle());

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                    "<div style='max-width: 600px; margin: 0 auto;'>" +
                    "<h2 style='color: #28a745;'>🎉 Chúc Mừng! Bạn Đã Được Chấp Nhận</h2>" +
                    "<p>Xin chào " + getCandidateName(candidate) + ",</p>" +
                    "<p>Chúng tôi vui mừng thông báo rằng bạn đã được chấp nhận cho vị trí <strong>" + job.getTitle() + "</strong>.</p>" +
                    "<p>Vui lòng liên hệ bộ phận nhân sự để hoàn tất các thủ tục tiếp theo.</p>" +
                    "<p>Trân trọng,<br/>Job Portal Team</p>" +
                    "</div>" +
                    "</body>" +
                    "</html>";
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send acceptance email: {}", e.getMessage());
        }
    }

    public void sendReviewingNotification(User candidate, JobPost job) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(getCandidateEmail(candidate));
            helper.setSubject("Hồ sơ đang được xem xét - " + job.getTitle());

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                    "<div style='max-width: 600px; margin: 0 auto;'>" +
                    "<h2 style='color: #17a2b8;'>📋 Hồ Sơ Đang Được Xem Xét</h2>" +
                    "<p>Xin chào " + getCandidateName(candidate) + ",</p>" +
                    "<p>Hồ sơ ứng tuyển của bạn cho vị trí <strong>" + job.getTitle() + "</strong> đang được xem xét bởi nhà tuyển dụng.</p>" +
                    "<p>Chúng tôi sẽ thông báo cho bạn về kết quả sớm nhất.</p>" +
                    "<p>Trân trọng,<br/>Job Portal Team</p>" +
                    "</div>" +
                    "</body>" +
                    "</html>";
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send reviewing email: {}", e.getMessage());
        }
    }

    public void sendJobApprovalNotification(User employer, JobPost job) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(employer.getUsername());
            helper.setSubject("Tin tuyển dụng đã được phê duyệt - " + job.getTitle());
            
            String htmlContent = buildApprovalEmail(employer.getUsername(), job);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send job approval email: {}", e.getMessage());
        }
    }

    public void sendJobRejectionNotification(User employer, JobPost job, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(employer.getUsername());
            helper.setSubject("Tin tuyển dụng bị từ chối - " + job.getTitle());

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                    "<div style='max-width: 600px; margin: 0 auto;'>" +
                    "<h2 style='color: #dc3545;'>❌ Tin Tuyển Dụng Bị Từ Chối</h2>" +
                    "<p>Xin chào " + employer.getUsername() + ",</p>" +
                    "<p>Tin tuyển dụng <strong>" + job.getTitle() + "</strong> của bạn đã bị từ chối.</p>" +
                    "<p><strong>Lý do:</strong> " + (reason != null ? reason : "Không đáp ứng tiêu chuẩn") + "</p>" +
                    "<p>Vui lòng chỉnh sửa và nộp lại.</p>" +
                    "<p>Trân trọng,<br/>Job Portal Admin Team</p>" +
                    "</div>" +
                    "</body>" +
                    "</html>";
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send job rejection email: {}", e.getMessage());
        }
    }

    private String buildApplicationConfirmationEmail(String candidateName, JobPost job) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto;'>" +
                "<h2>Xác Nhận Ứng Tuyển</h2>" +
                "<p>Xin chào " + candidateName + ",</p>" +
                "<p>Cảm ơn bạn đã ứng tuyển vị trí <strong>" + job.getTitle() + "</strong> tại chúng tôi.</p>" +
                "<p>Chúng tôi sẽ xem xét hồ sơ của bạn và liên hệ với bạn sớm.</p>" +
                "<p><strong>Chi tiết vị trí:</strong></p>" +
                "<ul>" +
                "<li>Địa điểm: " + job.getLocation() + "</li>" +
                "<li>Loại hình: " + job.getEmploymentType() + "</li>" +
                "<li>Mức lương: $" + job.getSalary() + "</li>" +
                "</ul>" +
                "<p>Trân trọng,<br/>Job Portal Team</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildInterviewInvitationEmail(String candidateName, JobPost job, String interviewDetails) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto;'>" +
                "<h2 style='color: #28a745;'>🎉 Mời Phỏng Vấn</h2>" +
                "<p>Xin chào " + candidateName + ",</p>" +
                "<p>Chúc mừng! Hồ sơ của bạn đã được chọn cho vòng phỏng vấn vị trí <strong>" + job.getTitle() + "</strong>.</p>" +
                "<p><strong>Chi tiết phỏng vấn:</strong></p>" +
                "<p>" + interviewDetails + "</p>" +
                "<p>Vui lòng xác nhận sự tham dự của bạn bằng cách trả lời email này.</p>" +
                "<p>Trân trọng,<br/>Job Portal Team</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildRejectionEmail(String candidateName, JobPost job) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto;'>" +
                "<h2>Kết Quả Ứng Tuyển</h2>" +
                "<p>Xin chào " + candidateName + ",</p>" +
                "<p>Cảm ơn bạn đã quan tâm đến vị trí <strong>" + job.getTitle() + "</strong> tại chúng tôi.</p>" +
                "<p>Rất tiếc, lần này chúng tôi quyết định không tiếp tục với hồ sơ của bạn. " +
                "Tuy nhiên, chúng tôi khuyến khích bạn ứng tuyển các vị trí khác trong tương lai.</p>" +
                "<p>Trân trọng,<br/>Job Portal Team</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildApprovalEmail(String employerName, JobPost job) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                "<div style='max-width: 600px; margin: 0 auto;'>" +
                "<h2 style='color: #28a745;'>✓ Tin Tuyển Dụng Được Phê Duyệt</h2>" +
                "<p>Xin chào " + employerName + ",</p>" +
                "<p>Tin tuyển dụng <strong>" + job.getTitle() + "</strong> của bạn đã được phê duyệt và đã được công bố.</p>" +
                "<p>Các ứng viên có thể bắt đầu ứng tuyển vị trí này.</p>" +
                "<p>Trân trọng,<br/>Job Portal Admin Team</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Đặt lại mật khẩu - Job Portal");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333;'>" +
                    "<div style='max-width: 600px; margin: 0 auto;'>" +
                    "<h2 style='color: #2563eb;'>🔐 Đặt Lại Mật Khẩu</h2>" +
                    "<p>Xin chào,</p>" +
                    "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Job Portal.</p>" +
                    "<p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>" +
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='" + resetLink + "' style='display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;'>Đặt Lại Mật Khẩu</a>" +
                    "</div>" +
                    "<p style='color: #6b7280; font-size: 14px;'>Link này sẽ hết hạn sau 30 phút.</p>" +
                    "<p style='color: #6b7280; font-size: 14px;'>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>" +
                    "<p>Trân trọng,<br/>Job Portal Team</p>" +
                    "</div>" +
                    "</body>" +
                    "</html>";
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send password reset email: {}", e.getMessage());
        }
    }
}