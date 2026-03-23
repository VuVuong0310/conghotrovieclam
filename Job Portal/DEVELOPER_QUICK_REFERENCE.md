# Job Portal - Developer Quick Reference

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 16+
- MySQL 8.0+
- Git

### Startup Commands

**Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Server runs on http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 📂 Project Structure

```
Job Portal/
├── backend/
│   ├── src/main/java/com/jobportal/
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── JobPostController.java
│   │   │   ├── JobApplicationController.java
│   │   │   ├── CandidateProfileController.java
│   │   │   ├── EmployerDashboardController.java
│   │   │   ├── AdminController.java
│   │   │   ├── SearchController.java (NEW)
│   │   │   └── RecommendationController.java (NEW)
│   │   ├── service/
│   │   │   ├── JobSearchService.java (UPDATED)
│   │   │   ├── JobRecommendationService.java (NEW)
│   │   │   ├── JobApplicationService.java
│   │   │   ├── CandidateProfileService.java
│   │   │   ├── EmployerService.java
│   │   │   ├── AdminService.java
│   │   │   ├── EmailService.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   ├── JobPost.java
│   │   │   ├── JobApplication.java
│   │   │   ├── CandidateProfile.java
│   │   │   └── JobCategory.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   ├── JobPostRepository.java
│   │   │   ├── JobApplicationRepository.java
│   │   │   ├── CandidateProfileRepository.java (UPDATED)
│   │   │   └── JobCategoryRepository.java
│   │   ├── security/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtUtils.java
│   │   │   └── JwtAuthenticationFilter.java
│   │   └── JobPortalApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── JobList.js
│   │   │   ├── JobListAdvanced.js (NEW)
│   │   │   ├── JobRecommendations.js (NEW)
│   │   │   ├── JobDetails.js
│   │   │   ├── CreateJob.js
│   │   │   ├── CandidateProfile.js
│   │   │   ├── MyApplications.js
│   │   │   ├── EmployerDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── services/
│   │   │   ├── AuthService.js
│   │   │   └── JobService.js (UPDATED)
│   │   ├── App.js (UPDATED)
│   │   ├── App.css (UPDATED)
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── docs/
    ├── ADVANCED_SEARCH_README.md (NEW)
    ├── INTEGRATION_GUIDE.md (NEW)
    └── IMPLEMENTATION_SUMMARY_SESSION_9.md (NEW)
```

---

## 🔧 Key APIs

### Search Endpoint
```javascript
// Frontend
const results = await JobService.searchJobs({
  keyword: 'Python',
  location: 'Ho Chi Minh',
  minSalary: 20000000,
  maxSalary: 50000000,
  page: 0,
  size: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC'
});

// Backend URL
GET /api/search/jobs?keyword=Python&location=HCM&minSalary=20000000&page=0&size=10
```

### Recommendation Endpoint
```javascript
// Frontend
const recommendations = await JobService.getRecommendedJobs({
  page: 0,
  size: 10
});

// Backend URL (requires JWT token)
GET /api/recommendations/jobs?page=0&size=10
Authorization: Bearer {JWT_TOKEN}
```

---

## 👤 User Roles & Permissions

### Role: CANDIDATE
- Login/Register ✅
- View job list ✅
- Search jobs ✅
- View job details ✅
- Apply for jobs ✅
- View applications ✅
- Edit profile ✅
- Upload resume ✅
- View recommendations ✅

### Role: EMPLOYER
- Login/Register ✅
- Create job posts ✅
- View own jobs ✅
- View applications ✅
- Update application status ✅
- Dashboard with analytics ✅
- Receive email notifications ✅

### Role: ADMIN
- View system statistics ✅
- Approve/Reject job posts ✅
- Send approval emails ✅
- View all jobs ✅
- View all applications ✅
- Manage system settings ✅

---

## 🔐 Authentication Flow

```
User Login
  ↓
POST /api/auth/login (email, password)
  ↓
Verify credentials against database
  ↓
Generate JWT token
  ↓
Return token to frontend
  ↓
Frontend stores in localStorage
  ↓
Add to Authorization header for future requests:
  Authorization: Bearer {token}
```

---

## 🗄️ Database Schema

### Tables
- `users` - User accounts
- `roles` - Role definitions (CANDIDATE, EMPLOYER, ADMIN)
- `user_roles` - Many-to-Many relationship
- `job_posts` - Job listings
- `job_applications` - Application submissions
- `candidate_profiles` - Candidate information
- `job_categories` - Job categories

### Key Relationships
```
User (1) ──── (M) JobPost (Employer)
User (1) ──── (1) CandidateProfile
User (N) ──── (N) Role
JobPost (1) ──── (M) JobApplication
User (1) ──── (M) JobApplication
```

---

## 🎯 Frontend Routes

| Route | Component | Auth | Purpose |
|-------|-----------|------|---------|
| `/` | (redirects) | - | Home |
| `/login` | Login | - | Login page |
| `/register` | Register | - | Registration |
| `/jobs` | JobList | - | Basic job list |
| `/jobs-advanced` | JobListAdvanced | - | Advanced search |
| `/recommendations` | JobRecommendations | Yes | Recommendations |
| `/job/:id` | JobDetails | - | Job detail page |
| `/create-job` | CreateJob | Yes | Post new job |
| `/profile/:userId` | CandidateProfile | Yes | Edit profile |
| `/my-applications` | MyApplications | Yes | View applications |
| `/employer-dashboard` | EmployerDashboard | Yes | Employer board |
| `/admin-dashboard` | AdminDashboard | Yes | Admin board |

---

## 🌐 API Endpoint Categories

### Authentication (AuthController)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration

### Jobs (JobPostController)
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs` - Create job (employer)
- `PUT /api/jobs/{id}` - Update job (employer)
- `DELETE /api/jobs/{id}` - Delete job (employer)

### Search (SearchController) **NEW**
- `GET /api/search/jobs` - Advanced search
- `GET /api/search/category` - Category search
- `GET /api/search/related/{id}` - Related jobs

### Recommendations (RecommendationController) **NEW**
- `GET /api/recommendations/jobs` - Personalized (auth required)
- `GET /api/recommendations/trending` - Most applied
- `GET /api/recommendations/new` - Recently posted
- `GET /api/recommendations/similar/{id}` - Similar jobs

### Applications (JobApplicationController)
- `POST /api/applications/apply/{jobId}` - Apply for job
- `GET /api/applications/check/{jobId}` - Check if already applied
- `GET /api/applications/my-applications` - My applications
- `GET /api/applications/job/{jobId}` - Job applicants
- `PUT /api/applications/{id}/status` - Update status

### Profiles (CandidateProfileController)
- `GET /api/profile/{userId}` - Get profile
- `PUT /api/profile/{userId}` - Update profile
- `POST /api/profile/{userId}/resume` - Upload resume

### Dashboards
- `GET /api/employer/dashboard` - Dashboard stats
- `GET /api/employer/jobs` - My jobs
- `GET /api/employer/jobs/{id}/applications` - Job applicants
- `GET /api/admin/statistics` - System stats
- `POST /api/admin/jobs/{id}/approve` - Approve job
- `POST /api/admin/jobs/{id}/reject` - Reject job

---

## 🧪 Testing the APIs

### Using cURL

**Search Jobs:**
```bash
curl -X GET "http://localhost:8080/api/search/jobs?keyword=java&location=HCM&page=0&size=10"
```

**Get Recommendations (requires token):**
```bash
curl -X GET "http://localhost:8080/api/recommendations/jobs?page=0" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

**Trending Jobs:**
```bash
curl -X GET "http://localhost:8080/api/recommendations/trending?limit=10"
```

---

## 📊 Code Examples

### Create Job via API
```bash
curl -X POST http://localhost:8080/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Senior Java Developer",
    "description": "5+ years experience",
    "location": "Ho Chi Minh City",
    "salary": 80000000,
    "employmentType": "Full-time"
  }'
```

### Apply for Job
```bash
curl -X POST http://localhost:8080/api/applications/apply/1 \
  -H "Authorization: Bearer {token}"
```

### Search with Multiple Filters
```bash
curl -X GET "http://localhost:8080/api/search/jobs" \
  -G \
  --data-urlencode "keyword=Python" \
  --data-urlencode "location=Da Nang" \
  --data-urlencode "minSalary=30000000" \
  --data-urlencode "maxSalary=60000000" \
  --data-urlencode "employmentType=Part-time" \
  --data-urlencode "page=0" \
  --data-urlencode "size=20"
```

---

## 🐛 Debugging Tips

### Frontend
1. Open DevTools (F12)
2. Network tab - Check API calls
3. Console tab - Check for errors
4. Application tab - Verify JWT token in localStorage
5. React Developer Tools - Check component state

### Backend
1. Check logs in IDE console
2. Verify database connection
3. Check JWT token expiration
4. Verify CORS configuration
5. Check email service configuration

### Common Issues

| Issue | Debug Step |
|-------|-----------|
| API returns 401 | Check JWT token in localStorage |
| No search results | Check database has test data |
| Slow search | Add database indexes |
| CORS error | Verify `@CrossOrigin` in controller |
| Email not sending | Check Gmail SMTP settings |

---

## 📈 Performance Optimization

### Database
```sql
-- Add these indexes for better performance
CREATE INDEX idx_job_title ON job_posts(title);
CREATE INDEX idx_job_location ON job_posts(location);
CREATE INDEX idx_job_salary ON job_posts(salary);
CREATE INDEX idx_job_created_at ON job_posts(created_at DESC);
```

### Backend
- Use pagination (page + size parameters)
- Implement caching for trending jobs
- Use connection pooling
- Compress API responses

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Cache API responses in localStorage
- Lazy load images

---

## 🔄 Development Workflow

```
1. Create feature branch
2. Implement backend endpoint
3. Test backend with cURL/Postman
4. Implement frontend component
5. Wire component to backend API
6. Test in browser
7. Commit with meaningful message
8. Create pull request
9. Code review
10. Merge to main
```

---

## 📚 Useful Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [JPA Specification Pattern](https://docs.spring.io/spring-data/jpa/docs/current/reference/)
- [JWT Authentication](https://jwt.io)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 🎓 Code Style Guidelines

### Java
- Use camelCase for variables
- Use PascalCase for classes
- Add @RestController on controllers
- Add @Service on services
- Use try-catch for error handling
- Add meaningful variable names

### JavaScript/React
- Use camelCase for variables
- Use PascalCase for components
- Use hooks (useState, useEffect)
- Add error boundaries
- Handle loading states
- Add PropTypes validation

### Database
- Use snake_case for columns (created_at)
- Add indexes for frequently searched columns
- Use appropriate data types
- Add foreign keys with ON DELETE

---

**Last Updated:** January 2024
**Version:** 1.0
**Maintained By:** Development Team
