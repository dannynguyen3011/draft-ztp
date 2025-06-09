const session = require('express-session');
const Keycloak = require('keycloak-connect');
const path = require('path');

const keycloakConfig = {
  "realm": process.env.KEYCLOAK_REALM || "demo",
  "auth-server-url": process.env.KEYCLOAK_URL || "http://localhost:8080",
  "ssl-required": "external",
  "resource": process.env.KEYCLOAK_CLIENT_ID || "demo-client",
  "verify-token-audience": true,
  "credentials": {
    "secret": process.env.KEYCLOAK_CLIENT_SECRET
  },
  "confidential-port": 0,
  "policy-enforcer": {}
};

const setupAuth = (app) => {
  // Session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'some secret',
    resave: false,
    saveUninitialized: true,
    store: new session.MemoryStore()
  }));

  // Keycloak
  const keycloak = new Keycloak({
    store: new session.MemoryStore()
  }, keycloakConfig);

  // Middleware
  app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/'
  }));

  return keycloak;
};

// Middleware to protect routes
const protect = (keycloak) => {
  return keycloak.protect();
};

// Middleware to protect routes with specific roles
const protectWithRoles = (keycloak, roles) => {
  return keycloak.protect((token, request) => {
    return roles.some(role => token.hasRole(role));
  });
};

module.exports = {
  setupAuth,
  protect,
  protectWithRoles
}; 
