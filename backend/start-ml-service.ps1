# PowerShell script to start the ML service
Write-Host "🧠 Starting ML Risk Prediction Service..." -ForegroundColor Green

# Check if Python is installed
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists, create if not
if (!(Test-Path "venv")) {
    Write-Host "📦 Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install requirements
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Start the ML service
Write-Host "🚀 Starting FastAPI ML service on port 8000..." -ForegroundColor Green
Write-Host "📊 ML API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🔗 API docs available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "💚 Health check: http://localhost:8000/health" -ForegroundColor Cyan

python ml_service.py