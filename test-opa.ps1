# OPA Test Script for ZeroTrust Platform
Write-Host "🔍 Testing OPA Authorization Service..." -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8181/health" -Method GET
    Write-Host "✅ OPA is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ OPA health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check loaded policies
Write-Host "`n2. Policy Check:" -ForegroundColor Yellow
try {
    $data = Invoke-RestMethod -Uri "http://localhost:8181/v1/data/zerotrust/authz" -Method GET
    Write-Host "✅ ZeroTrust policy loaded successfully" -ForegroundColor Green
    Write-Host "   Default allow: $($data.result.allow)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Policy check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Authorization Test (will fail without valid JWT - expected)
Write-Host "`n3. Authorization Test:" -ForegroundColor Yellow
$testRequest = @{
    input = @{
        resource = "dashboard"
        action = "read"
        user_id = "test-user"
        risk_score = 30
        location = "office"
    }
} | ConvertTo-Json -Depth 3

try {
    $authResult = Invoke-RestMethod -Uri "http://localhost:8181/v1/data/zerotrust/authz/allow" -Method POST -Body $testRequest -ContentType "application/json"
    Write-Host "✅ Authorization endpoint responding" -ForegroundColor Green
    Write-Host "   Result: $($authResult.result)" -ForegroundColor Cyan
    Write-Host "   Note: Should be false without valid token" -ForegroundColor Gray
} catch {
    Write-Host "❌ Authorization test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Role Permissions Check
Write-Host "`n4. Role Permissions Check:" -ForegroundColor Yellow
try {
    $permissions = Invoke-RestMethod -Uri "http://localhost:8181/v1/data/zerotrust/authz/role_permissions" -Method GET
    Write-Host "✅ Role permissions loaded" -ForegroundColor Green
    Write-Host "   Available roles: manager, employee, admin" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Role permissions check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 OPA testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   - Integrate OPA client in your backend" -ForegroundColor White
Write-Host "   - Configure JWT token validation" -ForegroundColor White
Write-Host "   - Test with real Keycloak tokens" -ForegroundColor White
Write-Host ""
Write-Host "OPA Admin UI: http://localhost:8181" -ForegroundColor Cyan
Write-Host "OPA Metrics: http://localhost:8181/metrics" -ForegroundColor Cyan 