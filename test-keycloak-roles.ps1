# Test Keycloak Roles Integration
Write-Host "Testing Keycloak Role Integration..." -ForegroundColor Green
Write-Host ""

# You'll need to get an actual token from Keycloak first
# This is just a template showing the structure

Write-Host "1. Get Token from Keycloak:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:8080/realms/demo-realm/protocol/openid-connect/token \\" -ForegroundColor Cyan
Write-Host "  -H 'Content-Type: application/x-www-form-urlencoded' \\" -ForegroundColor Cyan  
Write-Host "  -d 'grant_type=password&client_id=your-client-id&username=test-user&password=password'" -ForegroundColor Cyan

Write-Host ""
Write-Host "2. Expected Token Structure:" -ForegroundColor Yellow
$expectedToken = @"
{
  "realm_access": {
    "roles": ["manager"]
  },
  "resource_access": {
    "your-client-id": {
      "roles": ["manager"] 
    }
  }
}
"@
Write-Host $expectedToken -ForegroundColor Gray

Write-Host ""
Write-Host "3. Test with OPA:" -ForegroundColor Yellow
Write-Host "Use the token in OPA authorization requests" -ForegroundColor White

Write-Host ""
Write-Host "Required Keycloak Roles:" -ForegroundColor Yellow
Write-Host "- manager (full operational access)" -ForegroundColor Green
Write-Host "- employee (limited access)" -ForegroundColor Green  
Write-Host "- admin (full system access)" -ForegroundColor Green 