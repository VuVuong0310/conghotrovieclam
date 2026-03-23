# Email Configuration Guide

## Gmail SMTP Setup

To enable email functionality in the Job Portal application, you need to configure Gmail SMTP settings.

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings → Security → App passwords
2. Generate a new app password for "Job Portal"
3. Copy the 16-character password

### Step 3: Update application.properties
Replace the placeholder values in `backend/src/main/resources/application.properties`:

```properties
# Email configuration (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-character-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

### Step 4: Test Email Functionality
1. Start the backend server
2. Login as admin (admin/admin123)
3. Use the test email endpoint:

```bash
POST /api/admin/test-email
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "email": "test@example.com"
}
```

## Email Templates

The application includes the following email templates:

1. **Application Confirmation** - Sent when candidate applies for a job
2. **Interview Invitation** - Sent when application status changes to INTERVIEW
3. **Rejection Notification** - Sent when application is rejected
4. **Job Approval** - Sent to employer when admin approves their job posting

## Troubleshooting

- **Authentication failed**: Check your Gmail credentials and app password
- **Connection timeout**: Verify your internet connection and Gmail SMTP settings
- **Emails not received**: Check spam folder, verify recipient email address

## Security Notes

- Never commit real email credentials to version control
- Use environment variables for production deployment
- Consider using dedicated email services like SendGrid for production