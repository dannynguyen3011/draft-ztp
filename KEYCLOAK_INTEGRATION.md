# Keycloak Integration Guide

This guide explains how to set up and run your Zero Trust Platform with Keycloak authentication running in Docker.

## 🏗️ Architecture

```
Frontend (Next.js) ←→ Keycloak (Docker) ←→ Backend (Express.js)
     :3000               :8080                :3001
```

## 🐳 1. Start Keycloak Docker Container

First, ensure your Keycloak container is running:

```bash
# Example Docker command to run Keycloak
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

## ⚙️ 2. Configure Keycloak

### Access Keycloak Admin Console
1. Open http://localhost:8080
2. Login with admin credentials
3. Create or configure the "demo" realm

### Configure Client
1. Go to Clients → Create client
2. Set Client ID: `demo-client`
3. Enable "Client authentication" if you want a confidential client
4. Set Valid redirect URIs: `http://localhost:3000/*`
5. Set Web origins: `http://localhost:3000`

### Create Test Users
1. Go to Users → Add user
2. Create test users for authentication testing

## 🔧 3. Environment Configuration

### Frontend (.env.local)
```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=demo
KEYCLOAK_CLIENT_ID=demo-client
KEYCLOAK_CLIENT_SECRET=your-client-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this
```

### Backend (.env)
```env
PORT=3001
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=demo
KEYCLOAK_CLIENT_ID=demo-client
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-session-secret-change-this
```

## 🚀 4. Run the Application

### Start Backend Server
```bash
cd backend
npm run dev
```

### Start Frontend Development Server
```bash
cd frontend
pnpm dev
```

## 🔐 5. Authentication Flow

1. User visits http://localhost:3000
2. Clicks "Login with Keycloak" button
3. Gets redirected to Keycloak login page at http://localhost:8080
4. Enters credentials in Keycloak
5. Gets redirected back to frontend with authentication token
6. Frontend stores session and redirects to dashboard
7. Protected API calls to backend include the authentication token

## 🛠️ 6. Testing the Integration

### Test Pages
- **Login**: http://localhost:3000/login
- **Custom SignIn**: http://localhost:3000/auth/signin (debug info)
- **Dashboard**: http://localhost:3000/dashboard (protected)

### API Endpoints
- **Public**: http://localhost:3001/api/public
- **Protected**: http://localhost:3001/api/protected (requires authentication)

## 🔍 7. Troubleshooting

### Common Issues

1. **"Provider not found" error**
   - Check that Keycloak container is running on port 8080
   - Verify environment variables are set correctly
   - Ensure KEYCLOAK_CLIENT_SECRET is set if using confidential client

2. **Redirect issues**
   - Verify redirect URIs in Keycloak client configuration
   - Check that NEXTAUTH_URL matches your frontend URL

3. **CORS errors**
   - Ensure Web origins are set in Keycloak client
   - Check backend CORS configuration

### Debug Steps
1. Check browser console for errors
2. Verify Keycloak is accessible at http://localhost:8080
3. Check that all environment variables are loaded
4. Use the debug signin page at `/auth/signin`

## 📋 8. Keycloak Client Configuration Checklist

- [ ] Client ID: `demo-client`
- [ ] Client type: OpenID Connect
- [ ] Valid redirect URIs: `http://localhost:3000/*`
- [ ] Web origins: `http://localhost:3000`
- [ ] Client authentication: Enabled (if using client secret)
- [ ] Standard flow enabled: Yes
- [ ] Direct access grants enabled: Yes (optional)

## 🔗 9. Next Steps

After successful integration:
1. Configure user roles and permissions in Keycloak
2. Set up proper client secrets for production
3. Configure SSL/TLS for production deployment
4. Set up user registration flows
5. Configure multi-factor authentication
6. Set up proper logging and monitoring

## 📚 10. Useful Commands

```bash
# Check if Keycloak is running
curl http://localhost:8080/realms/demo/.well-known/openid_configuration

# Test backend API
curl http://localhost:3001/api/public
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/protected

# View NextAuth providers
curl http://localhost:3000/api/auth/providers
``` 