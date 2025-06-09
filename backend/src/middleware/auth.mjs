import session from 'express-session';
import Keycloak from 'keycloak-connect';

const keycloakConfig = {
  "realm": process.env.KEYCLOAK_REALM || "demo",
  "auth-server-url": process.env.KEYCLOAK_URL || "http://localhost:8080",
  "ssl-required": "none",
  "resource": process.env.KEYCLOAK_CLIENT_ID || "demo-client",
  "public-client": true,
  "confidential-port": 0,
  "verify-token-audience": false,
  "use-resource-role-mappings": true,
  "enable-cors": true
};

export const setupAuth = (app) => {
  // Session
  const memoryStore = new session.MemoryStore();
  app.use(session({
    secret: process.env.SESSION_SECRET || 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    cookie: {
      secure: false,
      sameSite: 'lax'
    }
  }));

  // Keycloak
  const keycloak = new Keycloak({
    store: memoryStore,
  }, keycloakConfig);

  // Middleware
  app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/',
    protected: '/protected'
  }));

  return keycloak;
};

export const protect = (keycloak) => {
  return keycloak.protect();
};

export const protectWithRoles = (keycloak, roles) => {
  return keycloak.protect((token) => {
    return roles.some(role => token.hasRole(role));
  });
}; 