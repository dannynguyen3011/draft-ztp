import session from 'express-session';
import Keycloak from 'keycloak-connect';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session store configuration
const memoryStore = new session.MemoryStore();

// Session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'some-secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
};

// Initialize Keycloak
const keycloakConfig = {
  realm: 'demo',
  authServerUrl: 'http://localhost:8080',
  resource: 'demo-client',
  sslRequired: 'external',
  publicClient: true,
  confidentialPort: 0
};

// Create Keycloak instance
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

export { keycloak, memoryStore };
