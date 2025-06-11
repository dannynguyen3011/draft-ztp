# Start Backend with MongoDB Integration
Write-Host "🚀 Starting ZeroTrust Backend with MongoDB Integration" -ForegroundColor Green
Write-Host ""

# Check if in correct directory
if (!(Test-Path "backend/package.json")) {
    Write-Host "❌ Please run this script from the draft-ztp root directory" -ForegroundColor Red
    exit 1
}

# Kill any existing node processes (optional)
Write-Host "🔄 Stopping any existing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Start backend
Write-Host "🎯 Starting backend server..." -ForegroundColor Yellow
Set-Location backend
$backendJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm start 
}

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Return to root directory
Set-Location ..

# Test the integration
Write-Host "🧪 Testing MongoDB integration..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Run the test script
.\test-mongodb-integration.ps1

Write-Host ""
Write-Host "📋 Backend Status:" -ForegroundColor Yellow
Write-Host "   Job ID: $($backendJob.Id)" -ForegroundColor Cyan
Write-Host "   Status: $($backendJob.State)" -ForegroundColor Cyan

Write-Host ""
Write-Host "🛑 To stop the backend:" -ForegroundColor Yellow
Write-Host "   Stop-Job $($backendJob.Id); Remove-Job $($backendJob.Id)" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Backend with MongoDB integration is ready!" -ForegroundColor Green 