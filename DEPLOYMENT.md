# Hospital Analytics Admin Console - Deployment Guide

## Production Setup

### 1. Environment Configuration

Copy `production.env.example` to `.env` files:

```bash
# Backend
cp production.env.example backend/.env

# Frontend  
cp production.env.example frontend/.env.local
```

Edit the files with your production values including the Hospital MongoDB Atlas connection string.

### 2. Hospital Database Connection

Ensure your MongoDB Atlas connection is properly configured:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hospital_analytics?retryWrites=true&w=majority&ssl=true&authSource=admin
```

**Important**: This connects to the existing hospital database. Do not create a new database.

### 3. Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Import Keycloak realm configuration
docker-compose exec keycloak /opt/keycloak/bin/kc.sh import --file /opt/keycloak/data/import/demo-realm.json
```

### 4. Manual Deployment

#### Backend
```bash
cd backend
npm install --production
NODE_ENV=production npm start
```

#### Frontend
```bash
cd frontend
npm install --production
npm run build
npm start
```

### 5. Production Checklist

- [ ] Hospital MongoDB Atlas connection string configured
- [ ] IP whitelist updated in MongoDB Atlas
- [ ] Database user permissions verified
- [ ] Set strong session secrets
- [ ] Configure SSL/TLS certificates
- [ ] Set proper CORS origins
- [ ] Configure Keycloak for HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all authentication flows
- [ ] Verify hospital data access

### 6. Hospital Data Verification

After deployment, verify access to hospital collections:

```bash
# Test backend health
curl http://localhost:3003/api/health

# Test hospital data access
curl -H "Authorization: Bearer <token>" http://localhost:3003/api/hospital/users?limit=5
```

### 7. Monitoring

Health checks available at:
- Backend: `http://localhost:3003/api/health`
- Hospital API: `http://localhost:3003/api/hospital/dashboard-metrics`
- Database connectivity and collection access included

### 8. Security Considerations

- **Never modify hospital data** - This is a read-only analytics console
- Change all default passwords
- Use environment-specific secrets
- Enable HTTPS in production
- Configure proper firewall rules
- Regular security updates
- Monitor access logs
- Implement proper backup procedures

### 9. Database Collections

The system reads from these hospital collections:
- `users` - Hospital staff and user data
- `user_activities` - User behavior and access logs
- `security_events` - Security incidents and alerts
- `risk_assessments` - Risk scoring data
- `behavior_patterns` - Behavioral analysis
- `department_activities` - Department metrics
- `system_metrics` - System performance data

### 10. Troubleshooting

Common issues:

**MongoDB Connection:**
- Verify IP whitelist in Atlas
- Check connection string format
- Ensure database user permissions
- Test network connectivity

**Data Access:**
- Verify collection names match
- Check user permissions
- Validate data structure
- Test API endpoints

**Authentication:**
- Keycloak configuration
- JWT token validation
- Role mapping
- CORS settings 