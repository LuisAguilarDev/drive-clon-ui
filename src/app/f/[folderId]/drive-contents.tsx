import { useState } from "react";
import { ChevronRight, Inbox } from "lucide-react";
import { Link } from "react-router-dom";

import { FileRow, FolderRow, ROW_GRID } from "./file-row";
import NewMenu from "./new-menu";
import UploadDropzone from "./upload-dropzone";
import { AppButton } from "~/components/ui/app-button";
import UserProfile from "~/components/user-profile";
import { createFolder, type FolderListing } from "~/lib/api/files";

export default function DriveContents(props: {
  listing: FolderListing | null;
  loading: boolean;
  error: string | null;
  currentFolderId: number;
  rootFolderId: number | null;
  onChanged: () => void | Promise<void>;
}) {
  const { listing, loading, error, currentFolderId, rootFolderId } = props;

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRoot =
    listing?.folder.parent_id === null || currentFolderId === rootFolderId;

  const submitNewFolder = async () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    setSubmitting(true);
    setCreateError(null);
    try {
      await createFolder(name, currentFolderId);
      setNewName("");
      setCreating(false);
      await props.onChanged();
    } catch (folderError) {
      setCreateError(
        folderError instanceof Error
          ? folderError.message
          : "Could not create folder",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black p-8 text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Cabecera: breadcrumb + usuario */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to={rootFolderId ? `/f/${rootFolderId}` : "#"}
              className="mr-2 text-ink-muted hover:text-white"
            >
              My Drive
            </Link>
            {!isRoot && listing && (
              <div className="flex items-center">
                <ChevronRight className="mx-2 text-ink-faint" size={16} />
                <span className="text-white">{listing.folder.name}</span>
              </div>
            )}
          </div>
          <UserProfile />
        </div>

        {/* Acciones */}
        <div className="mb-4 flex items-center gap-3">
          {creating ? (
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submitNewFolder();
              }}
            >
              <input
                autoFocus
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Folder name"
                className="rounded border border-elevated bg-control px-3 py-2 text-sm text-ink outline-none focus:border-ink-faint"
              />
              <AppButton type="submit" disabled={submitting || !newName.trim()}>
                {submitting ? "Creating…" : "Create"}
              </AppButton>
              <AppButton
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                  setCreateError(null);
                }}
              >
                Cancel
              </AppButton>
            </form>
          ) : (
            <NewMenu
              currentFolderId={currentFolderId}
              onNewFolder={() => setCreating(true)}
              onChanged={props.onChanged}
            />
          )}
        </div>
        {createError && (
          <p className="mb-4 text-sm text-white">{createError}</p>
        )}

        {/* Listado + drop zone */}
        <UploadDropzone folderId={currentFolderId} onUploaded={props.onChanged}>
          <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
            <div
              className={`border-b border-line bg-panel px-[22px] py-[14px] text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-subtle ${ROW_GRID}`}
            >
              <div>Name</div>
              <div>Owner</div>
              <div>Size</div>
            </div>

            {loading && (
              <p className="px-[22px] py-12 text-center text-ink-faint">
                Loading…
              </p>
            )}
            {error && !loading && (
              <p className="px-[22px] py-12 text-center text-ink">
                {error}
              </p>
            )}
            {!loading && !error && listing && (
              <ul className="divide-y divide-divider">
                {listing.folders.map((folder) => (
                  <FolderRow
                    key={`folder-${folder.id}`}
                    folder={folder}
                    onChanged={props.onChanged}
                  />
                ))}
                {listing.files.map((file) => (
                  <FileRow
                    key={`file-${file.id}`}
                    file={file}
                    onChanged={props.onChanged}
                  />
                ))}
                {listing.folders.length === 0 &&
                  listing.files.length === 0 && (
                    <li className="flex flex-col items-center gap-2 px-[22px] py-12 text-center text-ink-faint">
                      <Inbox size={28} />
                      <span>This folder is empty.</span>
                    </li>
                  )}
              </ul>
            )}
          </div>
        </UploadDropzone>
      </div>
    </div>
  );
}
