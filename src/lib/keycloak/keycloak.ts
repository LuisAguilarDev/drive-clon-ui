import Keycloak from "keycloak-js";

// Single Keycloak instance for the whole app. Configuration comes from Vite
// environment variables (prefixed with VITE_) so no secret ever lives in the
// client bundle — Google is federated *inside* Keycloak, not here.
// See .env.example for the expected keys.
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
