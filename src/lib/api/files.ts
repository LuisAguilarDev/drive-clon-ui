import { apiFetch } from "./client";

// Tipos y llamadas del sistema de ficheros. Reutiliza `apiFetch`, así que el
// Bearer token y el refresh transparente se gestionan solos.

export interface FolderSummary {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface FileOwner {
  id: number;
  name: string;
  is_me: boolean;
}

export interface DriveFile {
  id: number;
  name: string;
  content_type: string | null;
  size_bytes: number | null;
  owner: FileOwner;
  created_at: string;
}

export interface FolderListing {
  folder: FolderSummary;
  folders: FolderSummary[];
  files: DriveFile[];
}

/** Root folder of the current user (provisioned on first sign-in). */
export async function getRootFolder(): Promise<FolderSummary> {
  const response = await apiFetch("/files/root");
  if (!response.ok) {
    throw new Error(`Failed to load root folder: ${response.status}`);
  }
  return (await response.json()) as FolderSummary;
}

/** Subfolders + files contained in a folder. */
export async function listFolder(folderId: number): Promise<FolderListing> {
  const response = await apiFetch(`/files?folder_id=${folderId}`);
  if (!response.ok) {
    throw new Error(`Failed to list folder: ${response.status}`);
  }
  return (await response.json()) as FolderListing;
}

/** Create a folder inside `parentId`. */
export async function createFolder(
  name: string,
  parentId: number,
): Promise<FolderSummary> {
  const response = await apiFetch("/files/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parent_id: parentId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create folder: ${response.status}`);
  }
  return (await response.json()) as FolderSummary;
}

interface InitUploadResponse {
  file_id: number;
  upload_url: string;
  method: string;
}

/**
 * Sube un fichero con URL prefirmada en tres pasos:
 *   1. POST /files con METADATOS → el backend crea la fila PENDING y devuelve una
 *      URL prefirmada (el backend no recibe el binario).
 *   2. PUT del binario DIRECTO al almacenamiento con esa URL.
 *   3. POST /files/{id}/confirm → el backend verifica el objeto y lo activa.
 */
export async function uploadFile(
  folderId: number,
  file: File,
): Promise<DriveFile> {
  // Al subir una carpeta, el navegador usaría `webkitRelativePath`
  // (p. ej. "scripts/foo.txt") como name; nos quedamos con el nombre base para
  // no prefijar la carpeta al nombre almacenado.
  const baseName = file.name.split(/[\\/]/).pop() || file.name;

  // 1) Pedir la URL prefirmada (sólo metadatos).
  const initResponse = await apiFetch("/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: baseName,
      content_type: file.type || null,
      size_bytes: file.size,
      folder_id: folderId,
    }),
  });
  if (!initResponse.ok) {
    throw new Error(
      `Failed to start upload of "${baseName}": ${initResponse.status}`,
    );
  }
  const { file_id, upload_url } =
    (await initResponse.json()) as InitUploadResponse;

  // 2) Subir el binario DIRECTO al almacenamiento. Es una URL prefirmada: NO se
  //    le adjunta el Bearer (`fetch` plano, no `apiFetch`) ni cabeceras extra,
  //    que romperían la firma SigV4.
  const putResponse = await fetch(upload_url, { method: "PUT", body: file });
  if (!putResponse.ok) {
    throw new Error(
      `Failed to upload "${baseName}" to storage: ${putResponse.status}`,
    );
  }

  // 3) Confirmar: el backend comprueba el objeto y activa el fichero.
  const confirmResponse = await apiFetch(`/files/${file_id}/confirm`, {
    method: "POST",
  });
  if (!confirmResponse.ok) {
    throw new Error(
      `Failed to confirm upload of "${baseName}": ${confirmResponse.status}`,
    );
  }
  return (await confirmResponse.json()) as DriveFile;
}

/** Dispara la descarga de un blob en el navegador con el nombre indicado. */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Download a single file and save it with its original name. */
export async function downloadFile(
  fileId: number,
  name: string,
): Promise<void> {
  const response = await apiFetch(`/files/${fileId}/download`);
  if (!response.ok) {
    throw new Error(`Failed to download "${name}": ${response.status}`);
  }
  triggerBlobDownload(await response.blob(), name);
}

interface ArchiveJob {
  job_id: string;
  status: "queued" | "processing" | "ready" | "failed" | "expired";
  name: string;
  size_bytes: number | null;
  download_url: string | null;
  error: string | null;
}

const ARCHIVE_POLL_INTERVAL_MS = 1500;
const ARCHIVE_POLL_TIMEOUT_MS = 120_000;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Abre una URL de descarga (la cabecera Content-Disposition del objeto fuerza
 * que el navegador la descargue en vez de navegar a ella). */
function triggerUrlDownload(url: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Descarga una carpeta como ZIP (asíncrono): encola un job, hace poll hasta que
 * esté listo y entonces descarga el ZIP DIRECTO del almacenamiento por su URL
 * prefirmada (el ancho de banda no pasa por el backend).
 */
export async function downloadFolder(
  folderId: number,
  name: string,
): Promise<void> {
  const startResponse = await apiFetch(`/files/folders/${folderId}/archive`, {
    method: "POST",
  });
  if (!startResponse.ok) {
    throw new Error(`Failed to start ZIP of "${name}": ${startResponse.status}`);
  }
  const { job_id } = (await startResponse.json()) as ArchiveJob;

  const deadline = Date.now() + ARCHIVE_POLL_TIMEOUT_MS;
  for (;;) {
    const pollResponse = await apiFetch(`/files/archives/${job_id}`);
    if (!pollResponse.ok) {
      throw new Error(`Failed to check ZIP of "${name}": ${pollResponse.status}`);
    }
    const job = (await pollResponse.json()) as ArchiveJob;
    if (job.status === "ready" && job.download_url) {
      triggerUrlDownload(job.download_url);
      return;
    }
    if (job.status === "failed" || job.status === "expired") {
      throw new Error(job.error || `ZIP of "${name}" ${job.status}`);
    }
    if (Date.now() > deadline) {
      throw new Error(`Timed out preparing ZIP of "${name}"`);
    }
    await delay(ARCHIVE_POLL_INTERVAL_MS);
  }
}

/** Delete a single file (soft delete on the backend). */
export async function deleteFile(fileId: number, name: string): Promise<void> {
  const response = await apiFetch(`/files/${fileId}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`Failed to delete "${name}": ${response.status}`);
  }
}

/** Delete a folder and all its contents (recursive soft delete). */
export async function deleteFolder(
  folderId: number,
  name: string,
): Promise<void> {
  const response = await apiFetch(`/files/folders/${folderId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete "${name}": ${response.status}`);
  }
}

// --- Papelera (trash) -----------------------------------------------------
// El soft delete del backend ES la papelera: un elemento está "en la papelera"
// cuando tiene `deleted_at`. Sólo se listan los items de nivel tope.

export interface TrashFolder {
  id: number;
  name: string;
  parent_id: number | null;
  trashed_at: string;
}

export interface TrashFile {
  id: number;
  name: string;
  content_type: string | null;
  size_bytes: number | null;
  trashed_at: string;
}

export interface TrashListing {
  folders: TrashFolder[];
  files: TrashFile[];
}

/** Caller's trash: top-level trashed folders + files. */
export async function listTrash(): Promise<TrashListing> {
  const response = await apiFetch("/files/trash");
  if (!response.ok) {
    throw new Error(`Failed to load trash: ${response.status}`);
  }
  return (await response.json()) as TrashListing;
}

/** Restore a file from the trash (to its folder, or root if it's gone). */
export async function restoreFile(fileId: number, name: string): Promise<void> {
  const response = await apiFetch(`/files/${fileId}/restore`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to restore "${name}": ${response.status}`);
  }
}

/** Restore a folder and its subtree from the trash. */
export async function restoreFolder(
  folderId: number,
  name: string,
): Promise<void> {
  const response = await apiFetch(`/files/folders/${folderId}/restore`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to restore "${name}": ${response.status}`);
  }
}

/** Permanently delete a trashed file (DB row + MinIO object). */
export async function purgeFile(fileId: number, name: string): Promise<void> {
  const response = await apiFetch(`/files/${fileId}/permanent`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete "${name}": ${response.status}`);
  }
}

/** Permanently delete a trashed folder and its subtree. */
export async function purgeFolder(
  folderId: number,
  name: string,
): Promise<void> {
  const response = await apiFetch(`/files/folders/${folderId}/permanent`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete "${name}": ${response.status}`);
  }
}

/** Empty the trash: permanently delete everything in it. */
export async function emptyTrash(): Promise<void> {
  const response = await apiFetch("/files/trash", { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`Failed to empty trash: ${response.status}`);
  }
}

/** Short local date (e.g. "Jun 22, 2026"). Returns "—" when invalid. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Human-readable size (e.g. "20 KB"). Returns "—" when unknown. */
export function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}
