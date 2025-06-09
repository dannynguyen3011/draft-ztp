// keycloakService.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "demo",
  clientId: "demo-client",
});

export const initKeycloak = async () => {
  try {
    await keycloak.init({
      onLoad: "login-required",
    });
  } catch (error) {
    console.error("Keycloak initialization failed:", error);
  }
};

export default keycloak;
