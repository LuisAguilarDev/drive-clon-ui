import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "~/lib/keycloak/AuthProvider";
import { getRootFolder } from "~/lib/api/files";

export default function DrivePage() {
  const navigate = useNavigate();
  // `organization` confirma que el backend ya provisionó al usuario y su raíz.
  const { initialized, authenticated, organization } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !authenticated) {
      navigate("/sign-in");
    }
  }, [initialized, authenticated, navigate]);

  // Tras el login, abre la carpeta raíz del usuario.
  useEffect(() => {
    if (!initialized || !authenticated || !organization) {
      return;
    }
    let active = true;
    void getRootFolder()
      .then((root) => {
        if (active) {
          navigate(`/f/${root.id}`, { replace: true });
        }
      })
      .catch((rootError) => {
        if (active) {
          setError(
            rootError instanceof Error
              ? rootError.message
              : "Could not open your drive",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [initialized, authenticated, organization, navigate]);

  if (!initialized) {
    return <p className="text-neutral-400">Loading…</p>;
  }
  if (!authenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  if (error) {
    return <p className="text-red-400">{error}</p>;
  }
  return <p className="text-neutral-400">Opening your drive…</p>;
}
