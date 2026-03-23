# Job Portal - Testing Guide

## 🎯 System Status
✅ **Backend**: Running on `http://localhost:8080`  
✅ **Frontend**: Running on `http://localhost/jobportal/`  
✅ **Database**: MySQL configured and initialized

---

## 📱 Frontend Testing

### 1. Open the Application
Visit: **http://localhost/jobportal/**

### 2. User Registration Test

#### As Candidate:
1. Click "Register" → Choose role "Candidate"
2. Fill in: Email, Username, Password, Confirm Password
3. Expected: Account created, redirect to login

#### As Employer:
1. Click "Register" → Choose role "Employer"
2. Fill in: Email, Username, Password, Confirm Password
3. Expected: Account created with ROLE_EMPLOYER

#### As Admin:
1. Use the admin account pre-created in database
2. Username: `admin` Password: `admin123`

### 3. Login Test
1. Enter credentials (username/password)
2. Expected: Redirected to appropriate dashboard based on role
3. Check: JWT token stored in localStorage
4. Check: Authorization header includes Bearer token

### 4. Candidate User Journey

#### 4a. View Job Listings
- **URL**: http://localhost/jobportal/
- **Features to Test**:
  - All jobs are displayed with title, company, location, salary
  - Loading state appears while fetching
  - No errors in console
  - Click job card → View job details

#### 4b. Job Details Page
- **Click any job** to see details
- **Features**:
  - Full job description displayed
  - Application button visible if not applied
  - "Already applied" message if applied
  - One-click application submission
  - Success notification shows

#### 4c. Apply for Job
1. Navigate to any job details
2. Click "Apply Now" button
3. **Expected Results**:
   - Button changes or shows "Already Applied"
   - Success toast notification appears
   - Network request sent to `POST /api/applications/apply/{jobId}`
   - Notification created for employer (in database)

#### 4d. View My Applications
- **URL**: http://localhost/jobportal/my-applications
- **Features**:
  - List all submitted applications
  - Show application status:
    - ✅ SUBMITTED (default)
    - 🔍 REVIEWING
    - 📅 INTERVIEW
    - ✔️ ACCEPTED
    - ❌ REJECTED
    - 🚫 WITHDRAWN
  - Filter by status dropdown
  - Withdraw application button
  - Status update notifications

#### 4e. Withdraw Application
1. Go to "My Applications"
2. Find an application
3. Click "Withdraw" button
4. **Expected**:
   - Status changes to WITHDRAWN
   - Cannot re-apply (needs new application)
   - Confirmation message shows

#### 4f. Candidate Profile (if implemented)
- **Components to verify**:
  - Profile information display/edit
  - Work experience section (add/edit/delete)
  - Education section (add/edit/delete)
  - Skills list management
  - Portfolio/GitHub/LinkedIn links
  - Resume upload

### 5. Employer User Journey

#### 5a. Post a Job
- Create new job posting form
- **Fields**:
  - Job Title
  - Description
  - Requirements
  - Salary Range
  - Location
  - Employment Type (Full-time/Part-time/Contract)
  - Category
  - Application Deadline
- **Expected**: Job posted successfully, appears in job listings

#### 5b. View Applications
- **URL**: http://localhost/jobportal/employer (if route exists)
- **Features**:
  - List all received applications
  - Filter by job posting
  - Sort by submission date/status
  - Count by status

#### 5c. Update Application Status
1. Log in as Employer
2. View applications dashboard
3. Click application to view details
4. Update status:
   - SUBMITTED → REVIEWING
   - REVIEWING → INTERVIEW
   - INTERVIEW → ACCEPTED/REJECTED
5. **Expected**:
   - Status updated in database
   - Notification created for candidate
   - Candidate receives update notification

#### 5d. View Application Stats
- **Show statistics**:
  - Total applications received
  - Breakdown by status
  - Most applied jobs

### 6. Admin User Journey

#### 6a. Admin Dashboard (if implemented)
- View system statistics
- User management
- Job post moderation
- Application statistics

#### 6b. Admin Permissions
- Can view all users
- Can view all jobs
- Can view all applications
- Can modify any content

---

## 🔌 Backend API Testing (via Postman/cURL)

### Authentication Endpoints

#### 1. Register User
```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "roles": ["ROLE_CANDIDATE"]
}
```

#### 2. Login
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```
**Response**: Returns JWT token in `accessToken` field

#### 3. Use Token
```bash
GET http://localhost:8080/api/applications/my-applications
Authorization: Bearer <JWT_TOKEN>
```

### Job Endpoints

#### Get All Jobs
```bash
GET http://localhost:8080/api/jobs
```

#### Get Job Details (Requires Auth)
```bash
GET http://localhost:8080/api/jobs/{jobId}
Authorization: Bearer <JWT_TOKEN>
```

#### Create Job (Employer Only)
```bash
POST http://localhost:8080/api/jobs
Authorization: Bearer <EMPLOYER_JWT>
Content-Type: application/json

{
  "title": "Senior Developer",
  "description": "We're looking for...",
  "requirements": "5+ years experience",
  "salary": 50000000,
  "location": "Ho Chi Minh City",
  "employmentType": "FULL_TIME",
  "category": { "id": 1 }
}
```

### Application Endpoints

#### Apply for Job
```bash
POST http://localhost:8080/api/applications/apply/{jobId}
Authorization: Bearer <CANDIDATE_JWT>
```

#### Check if Already Applied
```bash
GET http://localhost:8080/api/applications/check/{jobId}
Authorization: Bearer <CANDIDATE_JWT>
```

#### Get My Applications
```bash
GET http://localhost:8080/api/applications/my-applications
Authorization: Bearer <CANDIDATE_JWT>
```

#### Get Employer's Applications
```bash
GET http://localhost:8080/api/applications/employer
Authorization: Bearer <EMPLOYER_JWT>
```

#### Update Application Status
```bash
PUT http://localhost:8080/api/applications/{applicationId}/status
Authorization: Bearer <EMPLOYER_JWT>
Content-Type: application/json

{
  "status": "INTERVIEW"
}
```

#### Withdraw Application
```bash
PUT http://localhost:8080/api/applications/{applicationId}/withdraw
Authorization: Bearer <CANDIDATE_JWT>
```

#### Get Application Statistics
```bash
GET http://localhost:8080/api/applications/stats
Authorization: Bearer <CANDIDATE_JWT>
```

### Recommendation Endpoints

#### Get Recommended Jobs
```bash
GET http://localhost:8080/api/recommendations/jobs?page=0&size=10
Authorization: Bearer <CANDIDATE_JWT>
```

#### Get Trending Jobs
```bash
GET http://localhost:8080/api/recommendations/trending
Authorization: Bearer <CANDIDATE_JWT>
```

#### Get New Jobs
```bash
GET http://localhost:8080/api/recommendations/new
Authorization: Bearer <CANDIDATE_JWT>
```

#### Get Similar Jobs
```bash
GET http://localhost:8080/api/recommendations/similar/{jobId}
Authorization: Bearer <CANDIDATE_JWT>
```

---

## 🗄️ Database Verification

### Check Created Tables
```sql
SHOW TABLES;
```

### Verify Data
```sql
-- Check users
SELECT * FROM users;
SELECT * FROM user_roles;

-- Check jobs
SELECT * FROM job_posts;
SELECT * FROM job_categories;

-- Check applications
SELECT id, status, created_at FROM job_applications;

-- Count applications by status
SELECT status, COUNT(*) FROM job_applications GROUP BY status;

-- Check notifications
SELECT * FROM notifications WHERE is_read = false;
SELECT COUNT(*) as unread_count FROM notifications WHERE is_read = false;

-- Check candidate profiles
SELECT * FROM candidate_profiles;
SELECT * FROM candidate_skills;
SELECT * FROM experiences;
SELECT * FROM educations;
```

---

## 🧪 Integration Testing Checklist

### Frontend ↔ Backend Communication
- [ ] Login endpoint works with credentials from React form
- [ ] JWT token properly stored in localStorage
- [ ] Token sent in Authorization header
- [ ] API calls receive 200/201 responses
- [ ] Error responses handled with toast notifications
- [ ] CORS properly allows frontend domain

### Data Consistency
- [ ] When candidate applies, jobApplicationRepository updates
- [ ] When status updated, notification table receives entry
- [ ] Withdrawn status prevents duplicate applications
- [ ] Candidate cannot apply to same job twice
- [ ] Employer can only see their own posted jobs

### Workflow Testing
- [ ] Complete user journey: Register → Login → Apply → Receive Status Update → Withdraw
- [ ] Complete employer journey: Login → Post Job → Receive Applications → Update Status
- [ ] Candidate receives all status notifications

---

## 🐛 Debugging Tips

### Check Browser Console
1. Open DevTools (F12)
2. Console tab: Look for network errors
3. Network tab: Click Applications tab to see API responses
4. Check localStorage for JWT token: `localStorage.getItem('token')`

### Check Backend Logs
Terminal where backend is running will show:
- API requests received
- Security validation
- SQL queries executed
- Error stack traces

### Common Issues

#### Issue: 403 Forbidden
- **Cause**: Missing or invalid JWT token
- **Fix**: Login and get new token

#### Issue: CORS Error
- **Cause**: Backend CORS not allowing frontend domain
- **Fix**: Check @CrossOrigin annotations in controllers

#### Issue: Database Connection Failed
- **Cause**: MySQL not running
- **Fix**: Start XAMPP MySQL service

#### Issue: Port 8080 In Use
- **Cause**: Previous backend process still running
- **Fix**: `taskkill /PID <PID> /F` or use different port

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Frontend loads without errors at http://localhost/jobportal/
2. ✅ Can register and login successfully
3. ✅ Can view job listings
4. ✅ Can submit job applications
5. ✅ Can view submitted applications
6. ✅ Can withdraw applications
7. ✅ Notifications appear for status changes
8. ✅ No errors in browser console
9. ✅ No errors in backend logs
10. ✅ Database shows all updates

---

**Ready to test? Start at http://localhost/jobportal/ and follow the user journeys above!**
