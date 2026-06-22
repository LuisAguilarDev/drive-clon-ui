import keycloak from "~/lib/keycloak/keycloak";

// Cliente HTTP hacia el backend. Centraliza dos cosas:
//   1. Adjuntar el access token de Keycloak como Bearer en cada petición.
//   2. Reaccionar a `X-Org-Provisioned`: cuando el backend acaba de crear la
//      organización del usuario, su token actual todavía no trae el claim, así
//      que forzamos un refresh transparente (el usuario ya está autenticado, no
//      se le pide nada). Así el token siguiente ya incluye la organización.

const API_URL = import.meta.env.VITE_API_URL;

// keycloak-js usa cabeceras en minúscula al exponerlas; Headers.get es
// case-insensitive de todas formas.
const ORG_PROVISIONED_HEADER = "x-org-provisioned";

// Segundos mínimos de validez antes de refrescar proactivamente el token.
const MIN_TOKEN_VALIDITY_SECONDS = 30;

async function authorizedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  // Refresca el token si está por expirar para no mandar uno caducado.
  await keycloak.updateToken(MIN_TOKEN_VALIDITY_SECONDS).catch(() => undefined);

  const headers = new Headers(options.headers);
  if (keycloak.token) {
    headers.set("Authorization", `Bearer ${keycloak.token}`);
  }

  return fetch(`${API_URL}${path}`, { ...options, headers });
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await authorizedFetch(path, options);

  // El backend creó la organización en esta llamada: refrescar para que el
  // próximo token traiga el claim `organization`. `-1` fuerza el refresh.
  if (response.headers.get(ORG_PROVISIONED_HEADER) === "true") {
    await keycloak.updateToken(-1).catch(() => undefined);
  }

  return response;
}

export interface Organization {
  id: number;
  name: string;
  keycloak_org_id: string;
}

export interface SessionData {
  email: string | null;
  name: string | null;
  picture: string | null;
  organization: Organization;
}

/**
 * Llama al backend para obtener la sesión del usuario. En la primera llamada de
 * un usuario nuevo, el backend crea su organización y la devuelve.
 */
export async function fetchSession(): Promise<SessionData> {
  const response = await apiFetch("/auth/session");
  if (!response.ok) {
    throw new Error(`Session request failed: ${response.status}`);
  }
  return (await response.json()) as SessionData;
}
