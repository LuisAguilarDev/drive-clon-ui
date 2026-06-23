import { useState } from "react";

import { createFolder, uploadFile } from "~/lib/api/files";

const DEFAULT_FOLDER_NAME = "New folder";

/**
 * Lógica de subida compartida entre la drop zone y el menú "New". Sube ficheros
 * uno a uno a la carpeta indicada y expone el estado (pendientes / error) para
 * que la UI lo refleje.
 */
export function useUploads(
  folderId: number,
  onUploaded: () => void | Promise<void>,
) {
  const [pending, setPending] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isUploading = pending.length > 0;

  // Sube la lista de ficheros a `targetFolderId` actualizando el estado.
  const runUploads = async (files: File[], targetFolderId: number) => {
    setPending(files.map((file) => file.name));
    try {
      for (const file of files) {
        await uploadFile(targetFolderId, file);
        setPending((prev) => prev.filter((name) => name !== file.name));
      }
      await onUploaded();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setPending([]);
    }
  };

  // Sube ficheros sueltos a la carpeta actual.
  const uploadAll = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) {
      return;
    }
    setError(null);
    await runUploads(list, folderId);
  };

  // Sube una carpeta: crea una carpeta con el nombre del directorio elegido y
  // sube sus ficheros dentro. La estructura anidada se aplana en esa carpeta.
  const uploadFolder = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) {
      return;
    }
    setError(null);
    try {
      const folderName =
        list[0].webkitRelativePath.split("/")[0] || DEFAULT_FOLDER_NAME;
      const created = await createFolder(folderName, folderId);
      await runUploads(list, created.id);
    } catch (folderError) {
      setError(
        folderError instanceof Error
          ? folderError.message
          : "Upload failed",
      );
    }
  };

  return { uploadAll, uploadFolder, pending, error, isUploading };
}
