###############################################################################
# Job Portal - Automated API Test Script (PowerShell)
# Chay: .\test-api.ps1
# Yeu cau: Backend dang chay tai http://localhost:8080
###############################################################################

$BASE = "http://localhost:8080"
$pass = 0; $fail = 0; $skip = 0
$tokens = @{}

function Write-Header($text) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-Test($name, $method, $url) {
    Write-Host "  [$method] $name" -NoNewline -ForegroundColor White
}

function Write-Pass($detail) {
    $script:pass++
    Write-Host " -> PASS" -ForegroundColor Green
    if ($detail) { Write-Host "       $detail" -ForegroundColor DarkGray }
}

function Write-Fail($detail) {
    $script:fail++
    Write-Host " -> FAIL" -ForegroundColor Red
    if ($detail) { Write-Host "       $detail" -ForegroundColor Yellow }
}

function Write-Skip($detail) {
    $script:skip++
    Write-Host " -> SKIP" -ForegroundColor Yellow
    if ($detail) { Write-Host "       $detail" -ForegroundColor DarkGray }
}

function Invoke-Api {
    param(
        [string]$Method = "GET",
        [string]$Uri,
        [string]$Body = $null,
        [string]$Token = $null
    )
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }

    try {
        $params = @{
            Method      = $Method
            Uri         = $Uri
            Headers     = $headers
            ErrorAction = "Stop"
        }
        if ($Body -and $Method -ne "GET") {
            $params["Body"] = [System.Text.Encoding]::UTF8.GetBytes($Body)
        }
        $resp = Invoke-RestMethod @params
        return @{ Success = $true; Data = $resp; Status = 200 }
    }
    catch {
        $status = 0
        $msg = $_.Exception.Message
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
            try {
                $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $msg = $reader.ReadToEnd()
                $reader.Close()
            } catch {}
        }
        return @{ Success = $false; Data = $msg; Status = $status }
    }
}

###############################################################################
Write-Host ""
Write-Host "  Job Portal - API Test Suite" -ForegroundColor Magenta
Write-Host "  Backend: $BASE" -ForegroundColor DarkGray
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host ""

# ---- Kiem tra backend co dang chay khong ----
Write-Header "0. KIEM TRA KET NOI BACKEND"
Write-Test "Health check" "GET" "$BASE/api/jobs"
$r = Invoke-Api -Uri "$BASE/api/jobs"
if ($r.Success -or $r.Status -eq 401 -or $r.Status -eq 403) {
    Write-Pass "Backend dang chay"
} else {
    Write-Fail "Khong ket noi duoc backend. Dam bao backend chay tai $BASE"
    Write-Host ""
    Write-Host "  Tong ket: PASS=$pass | FAIL=$fail | SKIP=$skip" -ForegroundColor Magenta
    exit 1
}

###############################################################################
# PHAN 1: REGISTER
###############################################################################
Write-Header "1. REGISTER - Dang ky tai khoan"

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$candidateUser  = "testcandidate_${ts}@test.com"
$employerUser   = "testemployer_${ts}@test.com"
$testPassword   = "Test@12345"

# 1a. Register Candidate
Write-Test "Register Candidate" "POST" "/api/auth/register"
$body = @{ username = $candidateUser; password = $testPassword; role = @("ROLE_CANDIDATE") } | ConvertTo-Json
$r = Invoke-Api -Method POST -Uri "$BASE/api/auth/register" -Body $body
if ($r.Success) { Write-Pass "User: $candidateUser" } else { Write-Fail $r.Data }

# 1b. Register Employer
Write-Test "Register Employer" "POST" "/api/auth/register"
$body = @{ username = $employerUser; password = $testPassword; role = @("ROLE_EMPLOYER") } | ConvertTo-Json
$r = Invoke-Api -Method POST -Uri "$BASE/api/auth/register" -Body $body
if ($r.Success) { Write-Pass "User: $employerUser" } else { Write-Fail $r.Data }

# 1c. Register duplicate (should fail)
Write-Test "Register duplicate (expect fail)" "POST" "/api/auth/register"
$body = @{ username = $candidateUser; password = $testPassword; role = @("ROLE_CANDIDATE") } | ConvertTo-Json
$r = Invoke-Api -Method POST -Uri "$BASE/api/auth/register" -Body $body
if (-not $r.Success) { Write-Pass "Dung - tu choi duplicate" } else { Write-Fail "Khong nen cho phep duplicate" }

###############################################################################
# PHAN 2: LOGIN + LAY TOKEN
###############################################################################
Write-Header "2. LOGIN - Dang nhap & lay JWT token"

# 2a. Login Candidate
Write-Test "Login Candidate" "POST" "/api/auth/login"
$body = @{ username = $candidateUser; password = $testPassword } | ConvertTo-Json
$r = Invoke-Api -Method POST -Uri "$BASE/api/auth/login" -Body $body
if ($r.Success -and $r.Data.token) {
    $tokens["candidate"] = $r.Data.token
    Write-Pass "Token received (len=$($r.Data.token.Length))"
} else { Write-Fail $r.Data }

# 2b. Login Employer
Write-Test "Login Employer" "POST" "/api/auth/login"
$body = @{ username = $employerUser; password = $testPassword } | ConvertTo-Json
$r = Invoke-Api -Method POST -Uri "$BASE/api/auth/login" -Body $body
if ($r.Success -and $r.Data.token) {
    $tokens["employer"] = $r.Data.token
    Write-Pass "Token received (len=$($r.Data.token.Length))"
} else { Write-Fail $r.Data }

# 2c. Login Admin (try default admin creds)
Write-Test "Login Admin (vuvanvuong2004@gmail.com)" "POST" "/api/auth/login"
$body = @{ username = "vuvanvuong2004@gmail.com"; password = "admin123" } | ConvertTo-Json
$r = Invoke-Api -Method POST -Uri "$BASE/api/auth/login" -Body $body
if ($r.Success -and $r.Data.token) {
    $tokens["admin"] = $r.Data.token
    Write-Pass "Admin token received"
} else {
    # Try registering admin
    $body = @{ username = "vuvanvuong2004@gmail.com"; password = "admin123"; role = @("ROLE_ADMIN") } | ConvertTo-Json
    $r2 = Invoke-Api -Method POST -Uri "$BASE/api/auth/register" -Body $body
    if ($r2.Success) {
        $body = @{ username = "vuvanvuong2004@gmail.com"; password = "admin123" } | ConvertTo-Json
        $r3 = Invoke-Api -Method POST -Uri "$BASE/api/auth/login" -Body $body
        if ($r3.Success -and $r3.Data.token) {
            $tokens["admin"] = $r3.Data.token
            Write-Pass "Admin registered & logged in"
        } else { Write-Skip "Khong dang nhap duoc admin" }
    } else { Write-Skip "Admin ko kha dung: $($r.Data)" }
}

# 2d. Login wrong password
Write-Test "Login wrong password (expect fail)" "POST" "/api/auth/login"
$body = @{ username = $candidateUser; password = "wrongpassword" } | ConvertTo-Json
$r = Invoke-Api -Method POST -Uri "$BASE/api/auth/login" -Body $body
if (-not $r.Success) { Write-Pass "Dung - tu choi sai mat khau" } else { Write-Fail "Khong nen cho phep" }

###############################################################################
# PHAN 3: JOB SEARCH & ADVANCED FILTERING
###############################################################################
Write-Header "3. JOB SEARCH & ADVANCED FILTERING"

# 3a. Search all jobs
Write-Test "Search all jobs" "GET" "/api/search/jobs"
$r = Invoke-Api -Uri "$BASE/api/search/jobs?page=0&size=5"
if ($r.Success) {
    $total = if ($r.Data.totalElements) { $r.Data.totalElements } else { "?" }
    Write-Pass "totalElements=$total"
} else { Write-Fail $r.Data }

# 3b. Search with keyword
Write-Test "Search keyword=java" "GET" "/api/search/jobs?keyword=java"
$r = Invoke-Api -Uri "$BASE/api/search/jobs?keyword=java&page=0&size=5"
if ($r.Success) { Write-Pass "OK" } else { Write-Fail $r.Data }

# 3c. Search with salary range
Write-Test "Search salary range" "GET" "/api/search/jobs?minSalary=..&maxSalary=.."
$r = Invoke-Api -Uri "$BASE/api/search/jobs?minSalary=10000000&maxSalary=100000000&page=0&size=5"
if ($r.Success) { Write-Pass "OK" } else { Write-Fail $r.Data }

# 3d. Search with sort
Write-Test "Search sort by salary ASC" "GET" "/api/search/jobs?sortBy=salary"
$r = Invoke-Api -Uri "$BASE/api/search/jobs?sortBy=salary&sortDirection=ASC&page=0&size=5"
if ($r.Success) { Write-Pass "OK" } else { Write-Fail $r.Data }

# 3e. Get categories
Write-Test "Get categories" "GET" "/api/categories"
$r = Invoke-Api -Uri "$BASE/api/categories"
if ($r.Success) {
    $cnt = if ($r.Data -is [array]) { $r.Data.Count } else { "?" }
    Write-Pass "count=$cnt"
} else { Write-Fail $r.Data }

###############################################################################
# PHAN 4: EMPLOYER - DANG TIN TUYEN DUNG
###############################################################################
Write-Header "4. EMPLOYER - DANG TIN TUYEN DUNG"

$jobId = $null

if ($tokens["employer"]) {
    # 4a. Create job
    Write-Test "Create Job Post" "POST" "/api/jobs"
    $jobBody = @{
        title          = "Senior Java Developer (Test $ts)"
        description    = "Mo ta cong viec test tu dong - Yeu cau Java, Spring Boot"
        location       = "Ho Chi Minh"
        salary         = 25000000
        employmentType = "Full-time"
    } | ConvertTo-Json
    $r = Invoke-Api -Method POST -Uri "$BASE/api/jobs" -Body $jobBody -Token $tokens["employer"]
    if ($r.Success -and $r.Data.id) {
        $jobId = $r.Data.id
        Write-Pass "Job created ID=$jobId"
    } else { Write-Fail $r.Data }

    # 4b. Get employer jobs
    Write-Test "Get employer jobs" "GET" "/api/employer/jobs"
    $r = Invoke-Api -Uri "$BASE/api/employer/jobs" -Token $tokens["employer"]
    if ($r.Success) {
        $cnt = if ($r.Data -is [array]) { $r.Data.Count } else { 1 }
        Write-Pass "jobs count=$cnt"
    } else { Write-Fail $r.Data }

    # 4c. Employer dashboard
    Write-Test "Employer dashboard stats" "GET" "/api/employer/dashboard"
    $r = Invoke-Api -Uri "$BASE/api/employer/dashboard" -Token $tokens["employer"]
    if ($r.Success) {
        Write-Pass "totalJobs=$($r.Data.totalJobs), totalApps=$($r.Data.totalApplications)"
    } else { Write-Fail $r.Data }
} else {
    Write-Skip "Employer token khong co"
}

###############################################################################
# PHAN 5: ADMIN - DUYET TIN & THONG KE
###############################################################################
Write-Header "5. ADMIN - DUYET TIN & THONG KE"

if ($tokens["admin"]) {
    # 5a. Get statistics
    Write-Test "Admin statistics" "GET" "/api/admin/statistics"
    $r = Invoke-Api -Uri "$BASE/api/admin/statistics" -Token $tokens["admin"]
    if ($r.Success) {
        Write-Pass "users=$($r.Data.totalUsers), jobs=$($r.Data.totalJobs), apps=$($r.Data.totalApplications)"
    } else { Write-Fail $r.Data }

    # 5b. Get pending jobs
    Write-Test "Pending jobs" "GET" "/api/admin/jobs/pending"
    $r = Invoke-Api -Uri "$BASE/api/admin/jobs/pending" -Token $tokens["admin"]
    if ($r.Success) {
        $cnt = if ($r.Data -is [array]) { $r.Data.Count } else { 0 }
        Write-Pass "pending=$cnt"

        # 5c. Approve first pending job if exists
        if ($cnt -gt 0) {
            $pendingJobId = $r.Data[0].id
            Write-Test "Approve job #$pendingJobId" "POST" "/api/admin/jobs/$pendingJobId/approve"
            $r2 = Invoke-Api -Method POST -Uri "$BASE/api/admin/jobs/$pendingJobId/approve" -Token $tokens["admin"]
            if ($r2.Success) { Write-Pass "Approved" } else { Write-Fail $r2.Data }
        }
    } else { Write-Fail $r.Data }

    # 5d. Category CRUD
    Write-Test "Create category" "POST" "/api/admin/categories"
    $catBody = @{ name = "Test Category $ts"; description = "Mo ta test" } | ConvertTo-Json
    $r = Invoke-Api -Method POST -Uri "$BASE/api/admin/categories" -Body $catBody -Token $tokens["admin"]
    if ($r.Success -and $r.Data.id) {
        $catId = $r.Data.id
        Write-Pass "Category created ID=$catId"

        # Delete it
        Write-Test "Delete category #$catId" "DELETE" "/api/admin/categories/$catId"
        $r2 = Invoke-Api -Method DELETE -Uri "$BASE/api/admin/categories/$catId" -Token $tokens["admin"]
        if ($r2.Success) { Write-Pass "Deleted" } else { Write-Fail $r2.Data }
    } else { Write-Fail $r.Data }
} else {
    Write-Skip "Admin token khong co - bo qua admin tests"
}

###############################################################################
# PHAN 6: JOB DETAILS PAGE
###############################################################################
Write-Header "6. JOB DETAILS - Xem chi tiet cong viec"

# Try to find an approved job
Write-Test "List all approved jobs" "GET" "/api/jobs"
$r = Invoke-Api -Uri "$BASE/api/jobs"
$approvedJobId = $null
if ($r.Success) {
    if ($r.Data -is [array] -and $r.Data.Count -gt 0) {
        $approvedJobId = $r.Data[0].id
        Write-Pass "Found $($r.Data.Count) approved jobs, using ID=$approvedJobId"
    } else {
        Write-Pass "0 approved jobs (co the can admin duyet truoc)"
    }
} else { Write-Fail $r.Data }

if ($approvedJobId) {
    Write-Test "Get job detail #$approvedJobId" "GET" "/api/jobs/$approvedJobId"
    $r = Invoke-Api -Uri "$BASE/api/jobs/$approvedJobId"
    if ($r.Success) {
        Write-Pass "title=$($r.Data.title)"
    } else { Write-Fail $r.Data }
} else {
    Write-Skip "Khong co approved job de test chi tiet"
}

###############################################################################
# PHAN 7: APPLY JOB ENDPOINT
###############################################################################
Write-Header "7. APPLY JOB - Ung vien ung tuyen"

$applicationId = $null

if ($tokens["candidate"] -and $approvedJobId) {
    # 7a. Apply
    Write-Test "Apply for job #$approvedJobId" "POST" "/api/applications/apply/$approvedJobId"
    $r = Invoke-Api -Method POST -Uri "$BASE/api/applications/apply/$approvedJobId" -Token $tokens["candidate"]
    if ($r.Success) { Write-Pass "Applied OK" } else { Write-Fail $r.Data }

    # 7b. Check applied
    Write-Test "Check if applied" "GET" "/api/applications/check/$approvedJobId"
    $r = Invoke-Api -Uri "$BASE/api/applications/check/$approvedJobId" -Token $tokens["candidate"]
    if ($r.Success -and $r.Data.applied -eq $true) { Write-Pass "applied=true" }
    elseif ($r.Success) { Write-Fail "applied should be true" }
    else { Write-Fail $r.Data }

    # 7c. Apply duplicate (should fail)
    Write-Test "Apply duplicate (expect fail)" "POST" "/api/applications/apply/$approvedJobId"
    $r = Invoke-Api -Method POST -Uri "$BASE/api/applications/apply/$approvedJobId" -Token $tokens["candidate"]
    if (-not $r.Success) { Write-Pass "Dung - tu choi duplicate" } else { Write-Fail "Khong nen cho phep" }
} elseif (-not $tokens["candidate"]) {
    Write-Skip "Candidate token khong co"
} else {
    Write-Skip "Khong co approved job de apply"
}

###############################################################################
# PHAN 8: MY APPLICATIONS - Lich su ung tuyen
###############################################################################
Write-Header "8. MY APPLICATIONS - Lich su ung tuyen"

if ($tokens["candidate"]) {
    # 8a. Get my applications
    Write-Test "Get my applications" "GET" "/api/applications/my-applications"
    $r = Invoke-Api -Uri "$BASE/api/applications/my-applications" -Token $tokens["candidate"]
    if ($r.Success) {
        $appList = $r.Data
        if ($appList -is [array]) {
            $cnt = $appList.Count
            if ($cnt -gt 0) { $applicationId = $appList[0].id }
        } else {
            $cnt = "paginated"
            if ($appList.content -and $appList.content.Count -gt 0) { $applicationId = $appList.content[0].id }
        }
        Write-Pass "count=$cnt"
    } else { Write-Fail $r.Data }

    # 8b. Get application stats
    Write-Test "Application stats" "GET" "/api/applications/stats"
    $r = Invoke-Api -Uri "$BASE/api/applications/stats" -Token $tokens["candidate"]
    if ($r.Success) {
        Write-Pass "totalApplications=$($r.Data.totalApplications)"
    } else { Write-Fail $r.Data }

    # 8c. Get by status
    Write-Test "Get apps by status=SUBMITTED" "GET" "/api/applications/status/SUBMITTED"
    $r = Invoke-Api -Uri "$BASE/api/applications/status/SUBMITTED" -Token $tokens["candidate"]
    if ($r.Success) { Write-Pass "OK" } else { Write-Fail $r.Data }

} else {
    Write-Skip "Candidate token khong co"
}

###############################################################################
# PHAN 9: EMPLOYER DASHBOARD - Quan ly ung vien
###############################################################################
Write-Header "9. EMPLOYER DASHBOARD - Quan ly ung vien"

if ($tokens["employer"] -and $applicationId) {
    # 9a. Get applications for employer
    Write-Test "Employer get all applications" "GET" "/api/applications/employer"
    $r = Invoke-Api -Uri "$BASE/api/applications/employer" -Token $tokens["employer"]
    if ($r.Success) { Write-Pass "OK" } else { Write-Fail $r.Data }

    # 9b. Update status to REVIEWING
    Write-Test "Update status -> REVIEWING" "PUT" "/api/applications/$applicationId/status"
    $statusBody = @{ status = "REVIEWING"; notes = "Dang xem xet ho so" } | ConvertTo-Json
    $r = Invoke-Api -Method PUT -Uri "$BASE/api/applications/$applicationId/status" -Body $statusBody -Token $tokens["employer"]
    if ($r.Success) { Write-Pass "Status updated" } else { Write-Fail $r.Data }

    # 9c. Schedule interview
    Write-Test "Schedule interview" "POST" "/api/applications/$applicationId/interview"
    $intBody = @{ interviewDate = "2026-04-01 10:00"; location = "Van phong HCM"; notes = "Mang CCCD" } | ConvertTo-Json
    $r = Invoke-Api -Method POST -Uri "$BASE/api/applications/$applicationId/interview" -Body $intBody -Token $tokens["employer"]
    if ($r.Success) { Write-Pass "Interview scheduled" } else { Write-Fail $r.Data }
} elseif (-not $tokens["employer"]) {
    Write-Skip "Employer token khong co"
} else {
    Write-Skip "Khong co applicationId de test"
}

###############################################################################
# PHAN 10: WITHDRAW - Rut lai don ung tuyen
###############################################################################
Write-Header "10. WITHDRAW - Rut lai don ung tuyen"

if ($tokens["candidate"] -and $applicationId) {
    Write-Test "Withdraw application #$applicationId" "PUT" "/api/applications/$applicationId/withdraw"
    $r = Invoke-Api -Method PUT -Uri "$BASE/api/applications/$applicationId/withdraw" -Token $tokens["candidate"]
    if ($r.Success) { Write-Pass "Withdrawn" } else { Write-Fail $r.Data }
} else {
    Write-Skip "Khong co application de withdraw"
}

###############################################################################
# PHAN 11: NOTIFICATIONS
###############################################################################
Write-Header "11. NOTIFICATIONS - Thong bao"

if ($tokens["candidate"]) {
    Write-Test "Get notifications" "GET" "/api/notifications"
    $r = Invoke-Api -Uri "$BASE/api/notifications?page=0&size=10" -Token $tokens["candidate"]
    if ($r.Success) { Write-Pass "OK" } else { Write-Fail $r.Data }

    Write-Test "Unread count" "GET" "/api/notifications/unread-count"
    $r = Invoke-Api -Uri "$BASE/api/notifications/unread-count" -Token $tokens["candidate"]
    if ($r.Success) { Write-Pass "unread=$($r.Data)" } else { Write-Fail $r.Data }
} else {
    Write-Skip "Candidate token khong co"
}

###############################################################################
# PHAN 12: EMAIL INTEGRATION TEST
###############################################################################
Write-Header "12. EMAIL INTEGRATION - Gui email test"

if ($tokens["admin"]) {
    Write-Test "Send test email" "POST" "/api/admin/test-email"
    $emailBody = @{ email = $candidateUser } | ConvertTo-Json
    $r = Invoke-Api -Method POST -Uri "$BASE/api/admin/test-email" -Body $emailBody -Token $tokens["admin"]
    if ($r.Success) {
        Write-Pass "Email sent (check inbox or mail server logs)"
    } else {
        Write-Fail "Email fail: $($r.Data) -- Kiem tra spring.mail config trong application.properties"
    }
} else {
    Write-Skip "Admin token khong co - bo qua email test"
}

###############################################################################
# TONG KET
###############################################################################
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Host "  TONG KET" -ForegroundColor Magenta
Write-Host ("=" * 60) -ForegroundColor Magenta
Write-Host ""
Write-Host "  PASS : $pass" -ForegroundColor Green
Write-Host "  FAIL : $fail" -ForegroundColor Red
Write-Host "  SKIP : $skip" -ForegroundColor Yellow
Write-Host "  TOTAL: $($pass + $fail + $skip)" -ForegroundColor White
Write-Host ""

if ($fail -eq 0) {
    Write-Host "  TAT CA TESTS THANH CONG!" -ForegroundColor Green
} else {
    Write-Host "  Co $fail test FAIL - xem chi tiet o tren." -ForegroundColor Red
}

Write-Host ""
Write-Host "  Tai khoan test da tao:" -ForegroundColor DarkGray
Write-Host "    Candidate: $candidateUser / $testPassword" -ForegroundColor DarkGray
Write-Host "    Employer : $employerUser / $testPassword" -ForegroundColor DarkGray
Write-Host ""
