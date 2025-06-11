# MongoDB Integration Test Script
Write-Host "🧪 Testing MongoDB Integration with ZeroTrust Platform" -ForegroundColor Green
Write-Host ""

# Test 1: Check if backend is running
Write-Host "1. Testing Backend Connection..." -ForegroundColor Yellow
try {
    $public = Invoke-RestMethod -Uri "http://localhost:3003/api/public" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is running on port 3003" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not running. Please start with: cd backend && npm start" -ForegroundColor Red
    exit 1
}

# Test 2: Check health endpoint (if available)
Write-Host "`n2. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3003/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Health endpoint working" -ForegroundColor Green
    Write-Host "   MongoDB Status: $($health.mongodb)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️ Health endpoint not available (this is expected if not implemented)" -ForegroundColor Orange
}

# Test 3: Test logging endpoint
Write-Host "`n3. Testing Authentication Logging..." -ForegroundColor Yellow

$testLog = @{
    username = "test-user"
    userId = "test-123"
    email = "test@example.com"
    roles = @("manager")
    action = "test_login"
    userAgent = "PowerShell-Test/1.0"
    riskLevel = "medium"
    success = $true
    sessionId = "session_test_123"
    metadata = @{
        realm = "demo"
        clientId = "demo-client"
        tokenType = "access_token"
    }
} | ConvertTo-Json -Depth 3

try {
    $logResult = Invoke-RestMethod -Uri "http://localhost:3003/api/log" -Method POST -Body $testLog -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Authentication logging successful!" -ForegroundColor Green
    Write-Host "   Log ID: $($logResult.logId)" -ForegroundColor Cyan
    Write-Host "   Message: $($logResult.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Authentication logging failed:" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Additional debugging
    Write-Host "`n🔍 Debug Information:" -ForegroundColor Yellow
    Write-Host "   Request URL: http://localhost:3003/api/log" -ForegroundColor Gray
    Write-Host "   Request Method: POST" -ForegroundColor Gray
    Write-Host "   Content-Type: application/json" -ForegroundColor Gray
    Write-Host "   Body: $testLog" -ForegroundColor Gray
}

# Test 4: Test retrieving logs
Write-Host "`n4. Testing Log Retrieval..." -ForegroundColor Yellow
try {
    $logs = Invoke-RestMethod -Uri "http://localhost:3003/api/log?limit=5" -Method GET -TimeoutSec 5
    Write-Host "✅ Log retrieval successful!" -ForegroundColor Green
    Write-Host "   Total logs: $($logs.pagination.total)" -ForegroundColor Cyan
    Write-Host "   Retrieved: $($logs.logs.Count) logs" -ForegroundColor Cyan
    
    if ($logs.logs.Count -gt 0) {
        Write-Host "`n   Recent log entries:" -ForegroundColor Cyan
        $logs.logs | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.username) | $($_.action) | $($_.timestamp)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Log retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Frontend integration test
Write-Host "`n5. Frontend Integration Check..." -ForegroundColor Yellow
if (Test-Path "../frontend/.env.local") {
    $envContent = Get-Content "../frontend/.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_BACKEND_URL=http://localhost:3003") {
        Write-Host "✅ Frontend configured for backend integration" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend env file exists but backend URL might not be configured" -ForegroundColor Orange
    }
} else {
    Write-Host "❌ Frontend .env.local file not found" -ForegroundColor Red
}

Write-Host "`n🎉 MongoDB Integration Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Ensure backend is running: cd backend && npm start" -ForegroundColor White
Write-Host "   2. Ensure frontend is running: cd frontend && npm run dev" -ForegroundColor White
Write-Host "   3. Login to dashboard and check browser console for log messages" -ForegroundColor White
Write-Host "   4. Check MongoDB for authentication logs" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:3003/api" -ForegroundColor Cyan
Write-Host "   Logs Endpoint: http://localhost:3003/api/log" -ForegroundColor Cyan 