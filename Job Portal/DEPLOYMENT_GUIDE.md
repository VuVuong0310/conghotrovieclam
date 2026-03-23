# 🚀 Job Portal Deployment Guide

## Deploy to Heroku (Free)

### Prerequisites
1. **Heroku Account**: Sign up at https://heroku.com
2. **Heroku CLI**: Download from https://devcenter.heroku.com/articles/heroku-cli
3. **Git**: Ensure Git is installed

### Step 1: Prepare Backend for Deployment

#### 1.1 Update Database Configuration
For production, we'll use Heroku Postgres instead of H2.

**Update `application.properties`:**
```properties
# Production Database (Heroku Postgres)
spring.datasource.url=${JDBC_DATABASE_URL}
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Keep H2 for local development
# spring.datasource.url=jdbc:h2:mem:jobportal_db
# spring.datasource.driverClassName=org.h2.Driver
# spring.jpa.hibernate.ddl-auto=update
# spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect

# Other configurations remain the same...
```

#### 1.2 Add PostgreSQL Dependency
**Update `pom.xml`:**
```xml
<!-- Add PostgreSQL driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <runtimeOnly>true</dependency>
</dependency>
```

#### 1.3 Create Procfile
**Create `backend/Procfile`:**
```
web: java -Dserver.port=$PORT -jar target/job-portal-backend-0.0.1-SNAPSHOT.jar
```

#### 1.4 Update CORS for Production
**Update `SecurityConfig.java`:**
```java
@Configuration
public class SecurityConfig {

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",    // Local development
            frontendUrl,                // Production frontend
            "https://your-frontend-app.herokuapp.com"  // Replace with actual frontend URL
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Step 2: Deploy Backend to Heroku

#### 2.1 Initialize Git Repository
```bash
cd "d:\J2EE\Job Portal\backend"
git init
git add .
git commit -m "Initial commit"
```

#### 2.2 Create Heroku App
```bash
heroku create your-job-portal-backend --region us
```

#### 2.3 Add PostgreSQL Add-on
```bash
heroku addons:create heroku-postgresql:hobby-dev -a your-job-portal-backend
```

#### 2.4 Set Environment Variables
```bash
heroku config:set JWT_SECRET="ChangeThisSecretKeyToSomethingLongerAndMoreSecure1234567890123456789012345678901234567890123456789" -a your-job-portal-backend
heroku config:set FRONTEND_URL="https://your-frontend-app.herokuapp.com" -a your-job-portal-backend
```

#### 2.5 Deploy Backend
```bash
git push heroku main
```

### Step 3: Prepare Frontend for Deployment

#### 3.1 Update API Base URL
**Update `frontend/src/services/AuthService.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

**Update `frontend/src/services/JobService.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

#### 3.2 Create Production Build
```bash
cd "d:\J2EE\Job Portal\frontend"
npm run build
```

#### 3.3 Create Static Server for Heroku
**Create `frontend/Procfile`:**
```
web: npm start
```

**Update `package.json`:**
```json
{
  "scripts": {
    "start": "serve -s build -l 3000",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "serve": "^14.2.1"
  }
}
```

### Step 4: Deploy Frontend to Heroku

#### 4.1 Initialize Git Repository
```bash
cd "d:\J2EE\Job Portal\frontend"
git init
git add .
git commit -m "Initial frontend commit"
```

#### 4.2 Create Heroku App
```bash
heroku create your-job-portal-frontend --region us
```

#### 4.3 Set Environment Variables
```bash
heroku config:set REACT_APP_API_URL="https://your-job-portal-backend.herokuapp.com" -a your-job-portal-frontend
```

#### 4.4 Deploy Frontend
```bash
git push heroku main
```

### Step 5: Update Backend CORS
After frontend deployment, update the backend CORS configuration with the actual frontend URL:

```bash
heroku config:set FRONTEND_URL="https://your-job-portal-frontend.herokuapp.com" -a your-job-portal-backend
```

### Step 6: Access Your Application

- **Frontend:** https://your-job-portal-frontend.herokuapp.com
- **Backend API:** https://your-job-portal-backend.herokuapp.com

### Test Accounts
- **Admin:** admin / admin123
- **Employer:** employer / employer123
- **Candidate:** candidate / candidate123

---

## Alternative: Deploy to Vercel + Railway

### Frontend (Vercel - Free)
1. Go to https://vercel.com
2. Connect your GitHub repository
3. Deploy the `frontend` folder
4. Set environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`

### Backend (Railway - Free)
1. Go to https://railway.app
2. Connect your GitHub repository
3. Deploy the `backend` folder
4. Add PostgreSQL database
5. Set environment variables:
   - `JWT_SECRET=your-secret-key`
   - `FRONTEND_URL=https://your-frontend.vercel.app`

---

## Troubleshooting

### Common Issues:

1. **Port Binding Error:**
   - Heroku assigns random port via `$PORT` environment variable
   - Ensure your Spring Boot app uses `server.port=${PORT:8080}`

2. **Database Connection:**
   - Heroku provides `JDBC_DATABASE_URL` automatically
   - Ensure PostgreSQL dependency is added

3. **CORS Issues:**
   - Update CORS configuration with production URLs
   - Ensure `FRONTEND_URL` environment variable is set

4. **Build Failures:**
   - Check Heroku logs: `heroku logs -a your-app-name`
   - Ensure all dependencies are in `pom.xml`

### Useful Commands:
```bash
# View logs
heroku logs -a your-app-name --tail

# View config
heroku config -a your-app-name

# Scale dyno
heroku ps:scale web=1 -a your-app-name

# Open app in browser
heroku open -a your-app-name
```

---

## Cost Estimation (Free Tier)

- **Heroku:** Free tier allows 550-1000 hours/month
- **PostgreSQL:** Hobby Dev plan (~$0)
- **Domain:** Heroku provides free subdomain

For production use, consider upgrading to paid plans when needed.