# Test script for ML Risk Prediction System
Write-Host "🧪 Testing ML Risk Prediction System..." -ForegroundColor Green

# Test ML Service Health
Write-Host "`n🔍 Testing ML Service Health..." -ForegroundColor Yellow
try {
    $mlHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
    Write-Host "✅ ML Service is healthy:" -ForegroundColor Green
    Write-Host "   - Status: $($mlHealth.status)" -ForegroundColor Cyan
    Write-Host "   - Model Loaded: $($mlHealth.model_loaded)" -ForegroundColor Cyan
    Write-Host "   - Encoders Loaded: $($mlHealth.encoders_loaded)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ML Service is not responding" -ForegroundColor Red
    Write-Host "   Make sure to start the ML service first" -ForegroundColor Yellow
    exit 1
}

# Test Backend API Health
Write-Host "`n🔍 Testing Backend API Health..." -ForegroundColor Yellow
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:3003/api/health" -Method GET
    Write-Host "✅ Backend API is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API is not responding" -ForegroundColor Red
    Write-Host "   Make sure to start the backend service first" -ForegroundColor Yellow
    exit 1
}

# Test Batch Prediction Status
Write-Host "`n🔍 Testing Batch Prediction Status..." -ForegroundColor Yellow
try {
    $batchStatus = Invoke-RestMethod -Uri "http://localhost:3003/api/logs/prediction-status" -Method GET
    Write-Host "✅ Batch prediction status retrieved:" -ForegroundColor Green
    Write-Host "   - Total Logs: $($batchStatus.status.totalLogs)" -ForegroundColor Cyan
    Write-Host "   - Predicted Logs: $($batchStatus.status.predictedLogs)" -ForegroundColor Cyan
    Write-Host "   - Unpredicted Logs: $($batchStatus.status.unpredictedLogs)" -ForegroundColor Cyan
    Write-Host "   - Percentage Predicted: $($batchStatus.status.percentagePredicted)%" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Could not fetch batch prediction status" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test ML Integration through Backend
Write-Host "`n🔍 Testing ML Integration through Backend..." -ForegroundColor Yellow
$testData = @{
    ip_region = "Vietnam"
    device_type = "known"
    user_role = "employee"
    action = "login"
    hour = 14
    sessionPeriod = 15
} | ConvertTo-Json

try {
    $prediction = Invoke-RestMethod -Uri "http://localhost:3003/api/risk/predict" -Method POST -ContentType "application/json" -Body $testData
    Write-Host "✅ ML Prediction successful:" -ForegroundColor Green
    Write-Host "   - Risk Score: $($prediction.riskScore)%" -ForegroundColor Cyan
    Write-Host "   - Risk Level: $($prediction.riskLevel)" -ForegroundColor Cyan
    Write-Host "   - Fallback Used: $($prediction.fallback)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ML Prediction failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test Frontend
Write-Host "`n🔍 Testing Frontend Availability..." -ForegroundColor Yellow
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -UseBasicParsing
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend is not responding" -ForegroundColor Red
    Write-Host "   Make sure to start the frontend service first" -ForegroundColor Yellow
}

Write-Host "`n🎉 Testing completed!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Navigate to http://localhost:3001" -ForegroundColor Cyan
Write-Host "   2. Login with admin/admin" -ForegroundColor Cyan
Write-Host "   3. Individual Predictions:" -ForegroundColor Yellow
Write-Host "      - Click 'ML Risk Prediction' to test single predictions" -ForegroundColor Cyan
Write-Host "   4. Batch Processing:" -ForegroundColor Yellow
Write-Host "      - Click 'ML Batch Processing' to process all audit logs" -ForegroundColor Cyan
Write-Host "   5. View Results:" -ForegroundColor Yellow
Write-Host "      - Go to 'User Activity' to see ML-predicted risk scores" -ForegroundColor Cyan
Write-Host "      - Look for blue 'ML' indicators next to risk scores" -ForegroundColor Cyan