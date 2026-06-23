import { useState } from "react";
import { Trash2 } from "lucide-react";

import { TrashFileRow, TrashFolderRow, TRASH_ROW_GRID } from "./trash-row";
import DriveLayout from "~/components/drive-layout";
import { AppButton } from "~/components/ui/app-button";
import UserProfile from "~/components/user-profile";
import { emptyTrash, type TrashListing } from "~/lib/api/files";

export default function TrashContents(props: {
  trash: TrashListing | null;
  loading: boolean;
  error: string | null;
  rootFolderId: number | null;
  onChanged: () => void | Promise<void>;
}) {
  const { trash, loading, error, rootFolderId } = props;

  // Confirmación en dos pasos del vaciado (operación destructiva e irreversible).
  const [confirmingEmpty, setConfirmingEmpty] = useState(false);
  const [emptying, setEmptying] = useState(false);

  const isEmpty =
    !!trash && trash.folders.length === 0 && trash.files.length === 0;

  const handleEmpty = async () => {
    setEmptying(true);
    try {
      await emptyTrash();
      setConfirmingEmpty(false);
      await props.onChanged();
    } finally {
      setEmptying(false);
    }
  };

  return (
    <DriveLayout rootFolderId={rootFolderId}>
      {/* Cabecera: título + usuario */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Trash</h1>
        <UserProfile />
      </div>

      {/* Aviso de auto-purga + vaciar papelera */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-subtle">
          Items in trash are deleted forever after 30 days.
        </p>
        {!isEmpty &&
          (confirmingEmpty ? (
            <div className="flex items-center gap-2">
              <AppButton
                type="button"
                onClick={() => void handleEmpty()}
                disabled={emptying}
              >
                {emptying ? "Emptying…" : "Delete forever"}
              </AppButton>
              <AppButton
                type="button"
                onClick={() => setConfirmingEmpty(false)}
                disabled={emptying}
              >
                Cancel
              </AppButton>
            </div>
          ) : (
            <AppButton type="button" onClick={() => setConfirmingEmpty(true)}>
              <Trash2 size={16} className="mr-2" />
              Empty trash
            </AppButton>
          ))}
      </div>

      {/* Listado */}
      <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
        <div
          className={`border-b border-line bg-panel px-[22px] py-[14px] text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-subtle ${TRASH_ROW_GRID}`}
        >
          <div>Name</div>
          <div>Deleted</div>
          <div>Size</div>
        </div>

        {loading && (
          <p className="px-[22px] py-12 text-center text-ink-faint">Loading…</p>
        )}
        {error && !loading && (
          <p className="px-[22px] py-12 text-center text-ink">{error}</p>
        )}
        {!loading && !error && trash && (
          <ul className="divide-y divide-divider">
            {trash.folders.map((folder) => (
              <TrashFolderRow
                key={`folder-${folder.id}`}
                folder={folder}
                onChanged={props.onChanged}
              />
            ))}
            {trash.files.map((file) => (
              <TrashFileRow
                key={`file-${file.id}`}
                file={file}
                onChanged={props.onChanged}
              />
            ))}
            {isEmpty && (
              <li className="flex flex-col items-center gap-2 px-[22px] py-12 text-center text-ink-faint">
                <Trash2 size={28} />
                <span>Trash is empty.</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </DriveLayout>
  );
}
