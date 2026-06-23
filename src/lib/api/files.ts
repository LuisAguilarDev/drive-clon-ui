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

/** Upload a single file into `folderId` (multipart). */
export async function uploadFile(
  folderId: number,
  file: File,
): Promise<DriveFile> {
  const form = new FormData();
  form.append("folder_id", String(folderId));
  // No fijar Content-Type: el navegador añade el boundary del multipart.
  // Pasamos el nombre base explícitamente: al subir una carpeta, el navegador
  // usaría `webkitRelativePath` (p. ej. "scripts/foo.txt") como nombre del
  // fichero, lo que prefijaría la carpeta al nombre almacenado.
  const baseName = file.name.split(/[\\/]/).pop() || file.name;
  form.append("file", file, baseName);

  const response = await apiFetch("/files", { method: "POST", body: form });
  if (!response.ok) {
    throw new Error(`Failed to upload "${file.name}": ${response.status}`);
  }
  return (await response.json()) as DriveFile;
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

/** Download a folder as a ZIP containing all its files (recursively). */
export async function downloadFolder(
  folderId: number,
  name: string,
): Promise<void> {
  const response = await apiFetch(`/files/folders/${folderId}/download`);
  if (!response.ok) {
    throw new Error(`Failed to download "${name}": ${response.status}`);
  }
  triggerBlobDownload(await response.blob(), `${name}.zip`);
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
