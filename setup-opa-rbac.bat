@echo off
REM Setup script for OPA + Keycloak RBAC Integration (Windows)
REM This script sets up the complete authorization system

echo 🚀 Setting up OPA + Keycloak RBAC for ZeroTrust Platform

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create necessary directories
echo [INFO] Creating OPA directories...
if not exist opa mkdir opa
if not exist opa\policies mkdir opa\policies
if not exist opa\config mkdir opa\config
if not exist opa\data mkdir opa\data

REM Copy environment file
if not exist .env (
    echo [INFO] Creating .env file from example...
    copy .env.example .env
    echo [WARN] Please update the .env file with your actual configuration
)

REM Start services
echo [INFO] Starting Keycloak and OPA services...
docker-compose up -d keycloak opa postgres

REM Wait for services to be healthy
echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak

REM Check services (simplified for Windows)
echo [INFO] Services should be starting...
echo   Keycloak: http://localhost:8080
echo   OPA: http://localhost:8181

echo ✅ OPA + Keycloak RBAC setup initiated!
echo.
echo 🔗 Service URLs:
echo    Keycloak Admin: http://localhost:8080/admin (admin/admin)
echo    OPA API: http://localhost:8181
echo    PostgreSQL: localhost:5432 (admin/admin)
echo.
echo 📚 Next Steps:
echo    1. Wait for services to fully start (2-3 minutes)
echo    2. Update your .env file with actual secrets
echo    3. Visit Keycloak admin console to configure users
echo    4. Load OPA policies manually or via API
echo    5. Start your application servers
echo.
echo [WARN] Remember to change default passwords in production! 