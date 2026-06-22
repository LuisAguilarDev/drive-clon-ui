import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from "react";
import keycloak from "./keycloak";

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

  useEffect(() => {
    let active = true;

    // Keep React state in sync whenever Keycloak swaps the token.
    keycloak.onAuthSuccess = () => {
      setAuthenticated(true);
      setUser(toUser());
    };
    keycloak.onAuthRefreshSuccess = () => setUser(toUser());
    keycloak.onAuthLogout = () => {
      setAuthenticated(false);
      setUser(null);
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
