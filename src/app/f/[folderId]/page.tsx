import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import DriveContents from "./drive-contents";
import { useAuth } from "~/lib/keycloak/AuthProvider";
import {
  getRootFolder,
  listFolder,
  type FolderListing,
} from "~/lib/api/files";

export default function GoogleDriveClone() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  // `organization` confirma que el backend ya provisionó al usuario (y su raíz).
  const { initialized, authenticated, organization } = useAuth();

  const parsedFolderId = parseInt(folderId ?? "", 10);

  const [listing, setListing] = useState<FolderListing | null>(null);
  const [rootFolderId, setRootFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (Number.isNaN(parsedFolderId)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setListing(await listFolder(parsedFolderId));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load folder",
      );
    } finally {
      setLoading(false);
    }
  }, [parsedFolderId]);

  // Redirige a sign-in si la sesión terminó.
  useEffect(() => {
    if (initialized && !authenticated) {
      navigate("/sign-in");
    }
  }, [initialized, authenticated, navigate]);

  // Carga el contenido de la carpeta una vez el usuario está provisionado.
  useEffect(() => {
    if (initialized && authenticated && organization) {
      void reload();
    }
  }, [initialized, authenticated, organization, reload]);

  // Resuelve la raíz (para el breadcrumb "My Drive").
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

  if (Number.isNaN(parsedFolderId)) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        Invalid folder ID
      </div>
    );
  }
  if (!initialized) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">Loading…</div>
    );
  }
  if (!authenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <DriveContents
      listing={listing}
      loading={loading}
      error={error}
      currentFolderId={parsedFolderId}
      rootFolderId={rootFolderId}
      onChanged={reload}
    />
  );
}
