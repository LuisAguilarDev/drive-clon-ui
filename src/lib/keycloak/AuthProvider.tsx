import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from "react";
import keycloak from "./keycloak";
import {
  fetchSession,
  type Organization,
  type SessionData,
} from "~/lib/api/client";

// Minimum amount of validity (in seconds) left on the access token before we
// proactively refresh it. Keycloak refreshes only if the token expires within
// this window.
const MIN_TOKEN_VALIDITY_SECONDS = 30;

export interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextValue {
  /** True once Keycloak finished its initial check-sso round-trip. */
  initialized: boolean;
  /** True when a valid session exists. */
  authenticated: boolean;
  /** Profile claims extracted from the Keycloak token, or null when signed out. */
  user: AuthUser | null;
  /**
   * The user's organization, provisioned by the backend on first sign-in.
   * Null until the session bootstrap completes (or while signed out).
   */
  organization: Organization | null;
  /** Raw access token, for attaching to backend/API requests. */
  token: string | undefined;
  /**
   * Start the OIDC login. Pass `idpHint` (e.g. "google") to jump straight to
   * that identity provider, skipping the Keycloak login page entirely.
   */
  login: (options?: { redirectTo?: string; idpHint?: string }) => void;
  /** End the Keycloak session and redirect home. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// keycloak-js forbids calling init() more than once per instance. React 18
// StrictMode mounts effects twice in development, so we guard with a shared
// promise and reuse it across mounts.
let initPromise: Promise<boolean> | null = null;

// The session bootstrap is triggered from two places (onAuthSuccess and after
// init). Dedupe with a shared in-flight promise so concurrent triggers don't
// fire two /auth/session calls — which would race the backend into creating two
// organizations for the same user.
let bootstrapPromise: Promise<SessionData | null> | null = null;

function bootstrapSession(): Promise<SessionData | null> {
  if (!bootstrapPromise) {
    bootstrapPromise = fetchSession().catch((error) => {
      console.error("Session bootstrap failed:", error);
      bootstrapPromise = null; // allow a retry on the next auth event
      return null;
    });
  }
  return bootstrapPromise;
}

function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    });
  }
  return initPromise;
}

function toUser(): AuthUser | null {
  const claims = keycloak.tokenParsed as
    | { email?: string; name?: string; picture?: string }
    | undefined;
  if (!claims?.email) {
    return null;
  }
  return { email: claims.email, name: claims.name, picture: claims.picture };
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    let active = true;

    // Provisiona/recupera la organización del usuario y la guarda en el estado.
    // El bootstrap en sí está deduplicado a nivel de módulo (bootstrapPromise).
    const loadOrganization = () => {
      void bootstrapSession().then((session) => {
        if (active && session) {
          setOrganization(session.organization);
        }
      });
    };

    // Keep React state in sync whenever Keycloak swaps the token.
    keycloak.onAuthSuccess = () => {
      setAuthenticated(true);
      setUser(toUser());
      loadOrganization();
    };
    keycloak.onAuthRefreshSuccess = () => setUser(toUser());
    keycloak.onAuthLogout = () => {
      setAuthenticated(false);
      setUser(null);
      setOrganization(null);
      bootstrapPromise = null; // permite re-provisionar tras un nuevo login
    };
    keycloak.onTokenExpired = () => {
      void keycloak.updateToken(MIN_TOKEN_VALIDITY_SECONDS);
    };

    initKeycloak()
      .then((isAuthenticated) => {
        if (!active) {
          return;
        }
        setAuthenticated(isAuthenticated);
        setUser(toUser());
        setInitialized(true);
        // check-sso puede restaurar una sesión existente; el bootstrap deduplica
        // con onAuthSuccess, así que llamarlo aquí también es seguro.
        if (isAuthenticated) {
          loadOrganization();
        }
      })
      .catch((error) => {
        console.error("Keycloak initialization failed:", error);
        if (active) {
          setInitialized(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = (options?: { redirectTo?: string; idpHint?: string }) => {
    void keycloak.login({
      redirectUri: `${window.location.origin}${options?.redirectTo ?? "/drive"}`,
      idpHint: options?.idpHint,
    });
  };

  const logout = () => {
    void keycloak.logout({ redirectUri: `${window.location.origin}/` });
  };

  return (
    <AuthContext.Provider
      value={{
        initialized,
        authenticated,
        user,
        organization,
        token: keycloak.token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
