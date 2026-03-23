# 🚀 Deploy Frontend to Vercel (Fast & Free)

## Quick Deploy Frontend to Vercel

### Step 1: Prepare Frontend for Production

#### 1.1 Update API Base URL
**Update `frontend/src/services/AuthService.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

**Update `frontend/src/services/JobService.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

#### 1.2 Create Production Build
```bash
cd "d:\J2EE\Job Portal\frontend"
npm run build
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy from project directory:**
```bash
cd "d:\J2EE\Job Portal\frontend"
vercel --prod
```

4. **Set Environment Variable:**
```bash
vercel env add REACT_APP_API_URL
# Enter: https://your-backend-url.herokuapp.com (or wherever your backend is deployed)
```

5. **Redeploy:**
```bash
vercel --prod
```

#### Option B: Using Vercel Web Interface

1. **Go to Vercel:** https://vercel.com
2. **Sign up/Login** with GitHub, GitLab, or email
3. **Click "New Project"**
4. **Import your Git repository** (or upload the frontend folder)
5. **Configure project:**
   - **Framework Preset:** React
   - **Root Directory:** frontend (if uploading folder)
   - **Build Command:** `npm run build`
   - **Output Directory:** build

6. **Add Environment Variable:**
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.herokuapp.com`

7. **Click "Deploy"**

### Step 3: Get Your Frontend URL

After deployment, Vercel will provide a URL like:
- `https://job-portal-frontend.vercel.app`
- `https://your-project-name.vercel.app`

### Step 4: Update Backend CORS (if needed)

If you have backend deployed elsewhere, update CORS configuration:

**In your backend's SecurityConfig.java:**
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",           // Local development
    "https://your-vercel-app.vercel.app", // Your Vercel frontend URL
    "http://localhost:8080"            // Local backend
));
```

### Step 5: Test Your Deployed App

1. **Open the Vercel URL** in your browser
2. **Try logging in** with test accounts:
   - Admin: admin/admin123
   - Employer: employer/employer123
   - Candidate: candidate/candidate123

### Vercel Features

✅ **Free Tier:** 100GB bandwidth, unlimited static sites  
✅ **Custom Domain:** Add your own domain for free  
✅ **Automatic HTTPS:** SSL certificate included  
✅ **Global CDN:** Fast loading worldwide  
✅ **Preview Deployments:** Test changes before production  
✅ **Environment Variables:** Secure configuration  

### Useful Vercel Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Redeploy
vercel --prod

# Add custom domain
vercel domains add yourdomain.com
```

### Troubleshooting

**Build Errors:**
- Check Vercel dashboard logs
- Ensure all dependencies are in `package.json`
- Verify build command: `npm run build`

**API Connection Issues:**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend CORS allows Vercel domain
- Test API endpoints directly in browser

**Environment Variables:**
- Must start with `REACT_APP_` to be accessible in React
- Changes require redeployment

---

## Alternative: Deploy to Netlify

1. **Go to Netlify:** https://netlify.com
2. **Drag & drop** the `build` folder or connect GitHub
3. **Set environment variable:** `REACT_APP_API_URL=https://your-backend-url`
4. **Deploy**

Netlify URL: `https://your-app-name.netlify.app`

---

## Your Frontend Link

After deployment, you'll get a URL like:
- **Vercel:** `https://job-portal-frontend.vercel.app`
- **Netlify:** `https://job-portal.netlify.app`

Share this link to let others access your Job Portal application!