# Job Portal - Advanced Search & Recommendation System

## 📋 Overview

This document describes the **Job Search & Filtering** and **Job Recommendation** features implemented in the Job Portal application.

## Features

### 1. **Advanced Job Search** (`/api/search/jobs`)

**Endpoint:** `GET /api/search/jobs`

**Query Parameters:**
- `keyword` (optional) - Search in job title and description
- `location` (optional) - Filter by job location
- `minSalary` (optional) - Filter jobs with minimum salary (in VND)
- `maxSalary` (optional) - Filter jobs with maximum salary (in VND)
- `employmentType` (optional) - Filter by employment type (Full-time, Part-time, Contract, Internship)
- `page` (default: 0) - Page number for pagination
- `size` (default: 10) - Number of results per page
- `sortBy` (default: id) - Sort field (id, title, salary, createdAt)
- `sortDirection` (default: DESC) - Sort direction (ASC or DESC)

**Example Request:**
```bash
GET /api/search/jobs?keyword=java&location=Ho%20Chi%20Minh&minSalary=50000000&maxSalary=100000000&page=0&size=10&sortBy=createdAt&sortDirection=DESC
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Senior Java Developer",
      "description": "We are looking for a senior Java developer with 5+ years experience",
      "location": "Ho Chi Minh City",
      "salary": 80000000,
      "employmentType": "Full-time",
      "employer": {
        "id": 1,
        "username": "tech_company"
      },
      "createdAt": "2024-01-15T10:30:00"
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "currentPage": 0,
  "pageSize": 10
}
```

### 2. **Search by Category** (`/api/search/category`)

**Endpoint:** `GET /api/search/category`

**Query Parameters:**
- `category` (required) - Category keyword (e.g., "IT", "Finance", "Healthcare")
- `page` (default: 0) - Page number
- `size` (default: 10) - Results per page

**Example:**
```bash
GET /api/search/category?category=IT&page=0&size=10
```

### 3. **Get Related Jobs** (`/api/search/related/{jobId}`)

**Endpoint:** `GET /api/search/related/{jobId}`

**Query Parameters:**
- `limit` (default: 5) - Number of related jobs to return

**Description:** Returns similar jobs based on the reference job's location and employment type.

### 4. **Job Recommendations** (`/api/recommendations/jobs`)

**Endpoint:** `GET /api/recommendations/jobs`

**Authentication:** Required (JWT token)

**Query Parameters:**
- `page` (default: 0) - Page number
- `size` (default: 10) - Results per page

**Recommendation Algorithm:**
The system calculates a score for each job based on:
1. **Skills Matching (40 points max)** - Compares candidate's skills with job description
2. **Title Keywords (30 points max)** - Matches job title with candidate profile
3. **Location Preference (15 points max)** - Matches candidate's location with job location
4. **Salary Alignment (15 points max)** - Recommends jobs with competitive salaries

**Example:**
```bash
GET /api/recommendations/jobs?page=0&size=10
```

### 5. **Trending Jobs** (`/api/recommendations/trending`)

**Endpoint:** `GET /api/recommendations/trending`

**Query Parameters:**
- `limit` (default: 10) - Number of trending jobs to return

**Description:** Returns the most applied jobs, sorted by application count.

### 6. **New Jobs** (`/api/recommendations/new`)

**Endpoint:** `GET /api/recommendations/new`

**Query Parameters:**
- `limitDays` (default: 7) - Number of days to look back for new jobs
- `limit` (default: 10) - Number of jobs to return

**Description:** Returns jobs posted in the last N days.

### 7. **Similar Jobs** (`/api/recommendations/similar/{jobId}`)

**Endpoint:** `GET /api/recommendations/similar/{jobId}`

**Query Parameters:**
- `limit` (default: 5) - Number of similar jobs to return

**Description:** Returns jobs with similar location or employment type.

## Frontend Implementation

### Components

#### 1. **JobListAdvanced.js**
Advanced search interface with filters for keyword, location, salary range, and employment type. Includes pagination and sorting options.

**Key Features:**
- Real-time filtering
- Pagination with page indicators
- Configurable results per page (5, 10, 20, 50)
- Multiple sort options (newest, title, salary)
- Fallback to basic API if advanced search fails

#### 2. **JobRecommendations.js**
Personalized job recommendations with multiple tabs for different discovery methods.

**Tabs:**
- ⭐ **Recommended** - Personalized recommendations based on candidate profile
- 🔥 **Trending** - Most popular jobs
- ✨ **New** - Recently posted jobs

**Key Features:**
- Tab-based navigation
- Pagination for recommended jobs
- Responsive card layout
- Quick view buttons

### Usage

**Search for Jobs:**
```javascript
import JobService from '../services/JobService';

const results = await JobService.searchJobs({
  keyword: 'Python',
  location: 'Ho Chi Minh',
  minSalary: 20000000,
  maxSalary: 50000000,
  page: 0,
  size: 10
});
```

**Get Recommendations:**
```javascript
const recommendations = await JobService.getRecommendedJobs({
  page: 0,
  size: 10
});
```

**Get Trending Jobs:**
```javascript
const trending = await JobService.getTrendingJobs(10);
```

## Database Optimization

### Recommended Indexes
Add the following indexes to improve search performance:

```sql
-- For keyword search
CREATE INDEX idx_job_title ON job_posts(title);
CREATE INDEX idx_job_description ON job_posts(description);

-- For location filter
CREATE INDEX idx_job_location ON job_posts(location);

-- For salary range filter
CREATE INDEX idx_job_salary ON job_posts(salary);

-- For employment type filter
CREATE INDEX idx_job_employment_type ON job_posts(employment_type);

-- For created_at sorting
CREATE INDEX idx_job_created_at ON job_posts(created_at DESC);
```

## Pagination

All list endpoints support pagination using:
- `page` - Zero-based page number (0, 1, 2, ...)
- `size` - Number of items per page (default: 10)

**Example:**
```bash
GET /api/search/jobs?page=2&size=20
# Returns items 40-59
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing/invalid JWT token (for protected endpoints)
- `500 Internal Server Error` - Server error

**Error Response:**
```json
{
  "error": "Error searching jobs: Invalid salary range"
}
```

## Navigation Routes

- `/jobs` - Basic job list (default job listing page)
- `/jobs-advanced` - Advanced search interface
- `/recommendations` - Job recommendations (authenticated users only)
- `/job/{id}` - Job details page

## Configuration

### Backend (application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/jobportal_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### Frontend (axios configuration)
Base URL is set to `http://localhost:8080` in all API calls.

## Performance Considerations

1. **Large Result Sets** - Use pagination to limit data transfer
2. **Complex Filters** - The Specification-based filtering supports multiple criteria simultaneously
3. **Search Optimization** - Full-text search on title and description fields
4. **Data Caching** - Consider implementing caching for trending/new jobs endpoints

## Future Enhancements

1. **Full-Text Search** - Implement MySQL FULLTEXT index for better search performance
2. **Search History** - Track and recommend based on user's search history
3. **Saved Searches** - Allow users to save favorite search filters
4. **Advanced Filters** - Add filters for company, experience level, education requirement
5. **Search Analytics** - Track search trends and popular keywords
6. **Machine Learning Recommendations** - Implement ML-based job matching algorithm
7. **Filter Presets** - Save commonly used filter combinations as presets

## Testing

### Test Cases

**Test Advanced Search:**
```bash
# Search with keyword
curl -H "Authorization: Bearer {token}" \
  "http://localhost:8080/api/search/jobs?keyword=Java&page=0&size=10"

# Search with multiple filters
curl -H "Authorization: Bearer {token}" \
  "http://localhost:8080/api/search/jobs?keyword=Python&location=Hanoi&minSalary=30000000&maxSalary=60000000&page=0&size=10"
```

**Test Recommendations:**
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:8080/api/recommendations/jobs?page=0&size=10"

curl "http://localhost:8080/api/recommendations/trending?limit=10"
```

## Troubleshooting

**Issue:** No results returned
- **Solution:** Check if jobs exist in database, modify filter criteria

**Issue:** Slow search queries
- **Solution:** Add database indexes on frequently searched columns

**Issue:** Authorization error in recommendations
- **Solution:** Ensure valid JWT token is provided in Authorization header

---

**Last Updated:** January 2024
**Version:** 1.0
