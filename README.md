# Hospital Analytics Admin Console

A zero-trust security platform that serves as an administrative console for monitoring and analyzing user behavior from a hospital web application. This system connects to the hospital's MongoDB Atlas database to provide real-time security analytics, risk assessment, and behavioral monitoring.

## Architecture

- **Frontend**: Next.js 14 with TypeScript (Admin Console)
- **Backend**: Express.js with Node.js (API Gateway)
- **Database**: Hospital MongoDB Atlas (hospital_analytics)
- **Authentication**: Keycloak (OpenID Connect)
- **Authorization**: Open Policy Agent (OPA)
- **Data Source**: Hospital Web Application Database

## Purpose

This platform acts as a **security monitoring dashboard** for hospital administrators to:
- Monitor user behavior patterns from the hospital application
- Assess security risks and anomalies
- Track authentication events and access patterns
- Generate security reports and analytics
- Manage user access policies

## Database Connection

The system connects to an existing hospital MongoDB Atlas database:
- **Database**: `hospital_analytics`
- **Collections**: `users`, `user_activities`, `security_events`, `risk_assessments`, `behavior_patterns`
- **Connection**: MongoDB Atlas cluster (cloud-hosted)

## Prerequisites

- Node.js 18+
- Access to Hospital MongoDB Atlas cluster
- Keycloak server
- OPA server (optional)

## Quick Start

### 1. Environment Setup

**Backend `.env`:**
```env
PORT=3003
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hospital_analytics?retryWrites=true&w=majority&ssl=true&authSource=admin
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=demo
KEYCLOAK_CLIENT_ID=demo-client
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=demo
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=demo-client
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_HOSPITAL_DB_NAME=hospital_analytics
```

### 2. Installation

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Start Services

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev
```

## Hospital Data Integration

### Data Sources

The admin console reads data from these hospital database collections:

1. **Users Collection** - Hospital staff, doctors, nurses, patients
2. **User Activities** - Login events, page access, data modifications
3. **Security Events** - Failed logins, suspicious activities, policy violations
4. **Risk Assessments** - User risk scores and behavioral analysis
5. **Behavior Patterns** - User behavior baselines and anomalies

### Monitoring Capabilities

- **Real-time User Activity Tracking**
- **Risk Score Calculation**
- **Anomaly Detection**
- **Department-wise Analytics**
- **Security Event Monitoring**
- **Behavioral Pattern Analysis**

## Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Import Keycloak realm configuration
docker-compose exec keycloak /opt/keycloak/bin/kc.sh import --file /opt/keycloak/data/import/demo-realm.json
```

### Production Environment

- Configure proper MongoDB Atlas connection string
- Set up SSL/TLS certificates
- Configure secure session secrets
- Enable proper CORS origins
- Set up monitoring and logging

## Features

- **Hospital User Management** - View and manage hospital users
- **Real-time Activity Monitoring** - Track user actions and access patterns
- **Security Event Dashboard** - Monitor security incidents and threats
- **Risk Assessment** - Behavioral risk scoring and alerts
- **Department Analytics** - Department-wise security metrics
- **Audit Trail** - Comprehensive logging and reporting
- **Zero-trust Security Model** - Policy-based access control

## API Endpoints

### Hospital Data
- `GET /api/hospital/users` - Hospital user management
- `GET /api/hospital/activities` - User activity monitoring
- `GET /api/hospital/security-events` - Security event tracking
- `GET /api/hospital/dashboard-metrics` - Real-time analytics

### System Management
- `GET /api/health` - Health check
- `POST /api/check-authorization` - Authorization verification
- `GET /api/hospital/export/security-report` - Report generation

## Security Configuration

### Role-based Access Control

- **Admin**: Full access to all hospital data and analytics
- **Manager**: Read-only access to analytics and reports
- **Doctor/Nurse**: Limited access to relevant data
- **Staff**: Basic dashboard access only

### Data Security

- **Encrypted connections** to MongoDB Atlas
- **JWT-based authentication** via Keycloak
- **Role-based authorization** with OPA policies
- **Audit logging** for all administrative actions

## Dashboard Components

1. **User Activity Monitor** - Real-time user behavior tracking
2. **Security Alert Center** - Critical security events and threats
3. **Risk Assessment Panel** - User risk scores and recommendations
4. **Department Analytics** - Department-wise security metrics
5. **Behavioral Analysis** - Anomaly detection and pattern analysis

## Connection Guide

The system connects to your hospital MongoDB Atlas database using the connection troubleshooting guide provided. Ensure:

1. IP whitelist is configured in MongoDB Atlas
2. Database user has proper permissions
3. Connection string includes all required parameters
4. Network/firewall allows MongoDB Atlas access

## License

Private - Hospital Administrative Use Only 