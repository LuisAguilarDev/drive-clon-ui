import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import TrashContents from "./trash-contents";
import { useAuth } from "~/lib/keycloak/AuthProvider";
import { getRootFolder, listTrash, type TrashListing } from "~/lib/api/files";

export default function TrashPage() {
  const navigate = useNavigate();
  // `organization` confirma que el backend ya provisionó al usuario.
  const { initialized, authenticated, organization } = useAuth();

  const [trash, setTrash] = useState<TrashListing | null>(null);
  const [rootFolderId, setRootFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTrash(await listTrash());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load trash",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirige a sign-in si la sesión terminó.
  useEffect(() => {
    if (initialized && !authenticated) {
      navigate("/sign-in");
    }
  }, [initialized, authenticated, navigate]);

  // Carga la papelera una vez el usuario está provisionado.
  useEffect(() => {
    if (initialized && authenticated && organization) {
      void reload();
    }
  }, [initialized, authenticated, organization, reload]);

  // Resuelve la raíz para el enlace "My Drive" del sidebar.
  useEffect(() => {
    if (!initialized || !authenticated || !organization) {
      return;
    }
    let active = true;
    void getRootFolder()
      .then((root) => {
        if (active) {
          setRootFolderId(root.id);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [initialized, authenticated, organization]);

  if (!initialized) {
    return <div className="min-h-screen bg-black p-8 text-white">Loading…</div>;
  }
  if (!authenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <TrashContents
      trash={trash}
      loading={loading}
      error={error}
      rootFolderId={rootFolderId}
      onChanged={reload}
    />
  );
}
