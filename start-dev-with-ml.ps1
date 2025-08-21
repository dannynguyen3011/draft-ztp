# Hospital Analytics Admin Console with ML - Development Startup Script
Write-Host "🏥 Starting Hospital Analytics Admin Console with ML Prediction..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python version: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python first." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
cd backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Setup Python environment and install ML dependencies
Write-Host "Setting up Python ML environment..." -ForegroundColor Cyan
if (!(Test-Path "venv")) {
    Write-Host "📦 Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment and install requirements
Write-Host "🔧 Installing Python ML dependencies..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}
deactivate

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Starting services..." -ForegroundColor Yellow

# Start ML service in background
Write-Host "Starting ML prediction service..." -ForegroundColor Cyan
cd ../backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\venv\Scripts\Activate.ps1'; python ml_service.py"

# Wait a moment for ML service to start
Start-Sleep -Seconds 5

# Start backend in background
Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Cyan
cd ../frontend
npm run dev

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔌 Backend API: http://localhost:3003" -ForegroundColor Cyan
Write-Host "🧠 ML Service: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📊 ML API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔐 Login: admin / admin" -ForegroundColor Magenta