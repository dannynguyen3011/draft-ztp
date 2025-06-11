#!/bin/bash

# Setup script for OPA + Keycloak RBAC Integration
# This script sets up the complete authorization system

set -e

echo "🚀 Setting up OPA + Keycloak RBAC for ZeroTrust Platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating OPA directories..."
mkdir -p opa/{policies,config,data}

# Copy environment file
if [ ! -f .env ]; then
    print_status "Creating .env file from example..."
    cp .env.example .env
    print_warning "Please update the .env file with your actual configuration"
fi

# Start services
print_status "Starting Keycloak and OPA services..."
docker-compose up -d keycloak opa postgres

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 30

# Check Keycloak health
print_status "Checking Keycloak health..."
for i in {1..30}; do
    if curl -f http://localhost:8080/health &>/dev/null; then
        print_status "Keycloak is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Keycloak failed to start"
        exit 1
    fi
    sleep 5
done

# Check OPA health
print_status "Checking OPA health..."
for i in {1..15}; do
    if curl -f http://localhost:8181/health &>/dev/null; then
        print_status "OPA is healthy"
        break
    fi
    if [ $i -eq 15 ]; then
        print_error "OPA failed to start"
        exit 1
    fi
    sleep 2
done

# Load OPA policies
print_status "Loading OPA policies..."
curl -X PUT http://localhost:8181/v1/policies/zerotrust \
  --data-binary @opa/policies/zerotrust.rego \
  --header "Content-Type: text/plain"

# Import Keycloak realm configuration
print_status "Importing Keycloak realm configuration..."
# The realm should be automatically imported via Docker volume mount

# Create test users in Keycloak (optional)
print_status "Setting up test users..."
cat > create_test_users.sh << 'EOF'
#!/bin/bash

KEYCLOAK_URL="http://localhost:8080"
REALM="demo"
ADMIN_USER="admin"
ADMIN_PASS="admin"

# Get admin token
TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  | jq -r '.access_token')

if [ "$TOKEN" = "null" ]; then
    echo "Failed to get admin token"
    exit 1
fi

# Create test employee user
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }],
    "realmRoles": ["employee"]
  }'

# Create test manager user
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane.smith",
    "email": "jane.smith@company.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }],
    "realmRoles": ["manager"]
  }'

echo "Test users created successfully"
EOF

chmod +x create_test_users.sh
./create_test_users.sh
rm create_test_users.sh

# Test OPA policies
print_status "Testing OPA policies..."
cat > test_opa.sh << 'EOF'
#!/bin/bash

OPA_URL="http://localhost:8181"

# Test manager access to analytics
echo "Testing manager access to analytics:"
curl -s -X POST "$OPA_URL/v1/data/zerotrust/authz/allow" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsibWFuYWdlciJdfX0.mock",
      "resource": "analytics",
      "action": "read",
      "jwt_secret": "your-jwt-secret",
      "client_id": "demo-client",
      "risk_score": 30,
      "location": "office"
    }
  }' | jq '.result'

# Test employee access to analytics (should be denied)
echo "Testing employee access to analytics:"
curl -s -X POST "$OPA_URL/v1/data/zerotrust/authz/allow" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZW1wbG95ZWUiXX19.mock",
      "resource": "analytics",
      "action": "read",
      "jwt_secret": "your-jwt-secret",
      "client_id": "demo-client",
      "risk_score": 30,
      "location": "office"
    }
  }' | jq '.result'
EOF

chmod +x test_opa.sh
./test_opa.sh
rm test_opa.sh

# Install frontend dependencies
if [ -d "frontend" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Install backend dependencies
if [ -d "backend" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

print_status "✅ OPA + Keycloak RBAC setup completed successfully!"
echo
echo "🔗 Service URLs:"
echo "   Keycloak Admin: http://localhost:8080/admin (admin/admin)"
echo "   OPA API: http://localhost:8181"
echo "   PostgreSQL: localhost:5432 (admin/admin)"
echo
echo "👥 Test Users:"
echo "   Employee: john.doe / password123"
echo "   Manager: jane.smith / password123"
echo
echo "📚 Next Steps:"
echo "   1. Update your .env file with actual secrets"
echo "   2. Configure Keycloak client settings"
echo "   3. Customize OPA policies in opa/policies/zerotrust.rego"
echo "   4. Start your application servers"
echo
print_warning "Remember to change default passwords in production!" 