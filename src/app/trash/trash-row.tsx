import { FileIcon, Folder as FolderIcon, RotateCcw, Trash2 } from "lucide-react";

import RowMenu from "~/app/f/[folderId]/row-menu";
import {
  formatBytes,
  formatDate,
  purgeFile,
  purgeFolder,
  restoreFile,
  restoreFolder,
  type TrashFile,
  type TrashFolder,
} from "~/lib/api/files";

// Rejilla compartida por la cabecera y las filas: Nombre | Borrado | Tamaño.
export const TRASH_ROW_GRID = "grid grid-cols-[1fr_180px_140px] items-center";

const iconClass = "shrink-0 text-ink-muted";
const rowClass = `group relative h-14 px-[22px] transition-[background] duration-[120ms] hover:bg-row-hover ${TRASH_ROW_GRID}`;
const secondaryCell = "text-[14px] text-ink-subtle";

// El borrado definitivo es irreversible: siempre pide confirmación.
const PURGE_CONFIRM = {
  prompt: "Delete forever? This can't be undone.",
  confirmLabel: "Delete forever",
  busyLabel: "Deleting…",
};

export function TrashFileRow(props: {
  file: TrashFile;
  onChanged: () => void | Promise<void>;
}) {
  const { file } = props;
  return (
    <li className={rowClass}>
      <div className="flex min-w-0 items-center gap-[14px] text-[15px] text-ink">
        <FileIcon size={18} className={iconClass} />
        <span className="truncate">{file.name}</span>
      </div>
      <div className={secondaryCell}>{formatDate(file.trashed_at)}</div>
      <div className={`${secondaryCell} tabular-nums`}>
        {formatBytes(file.size_bytes)}
      </div>
      <div className="absolute right-[10px] top-1/2 -translate-y-1/2">
        <RowMenu
          label={file.name}
          actions={[
            {
              key: "restore",
              icon: <RotateCcw size={16} />,
              label: "Restore",
              onSelect: async () => {
                await restoreFile(file.id, file.name);
                await props.onChanged();
              },
            },
            {
              key: "purge",
              icon: <Trash2 size={16} />,
              label: "Delete forever",
              confirm: PURGE_CONFIRM,
              onSelect: async () => {
                await purgeFile(file.id, file.name);
                await props.onChanged();
              },
            },
          ]}
        />
      </div>
    </li>
  );
}

export function TrashFolderRow(props: {
  folder: TrashFolder;
  onChanged: () => void | Promise<void>;
}) {
  const { folder } = props;
  return (
    <li className={rowClass}>
      {/* Las carpetas en papelera no son navegables: sólo se restauran o purgan. */}
      <div className="flex min-w-0 items-center gap-[14px] text-[15px] text-ink">
        <FolderIcon size={18} className={iconClass} />
        <span className="truncate">{folder.name}</span>
      </div>
      <div className={secondaryCell}>{formatDate(folder.trashed_at)}</div>
      <div className={`${secondaryCell} tabular-nums`}>—</div>
      <div className="absolute right-[10px] top-1/2 -translate-y-1/2">
        <RowMenu
          label={folder.name}
          actions={[
            {
              key: "restore",
              icon: <RotateCcw size={16} />,
              label: "Restore",
              onSelect: async () => {
                await restoreFolder(folder.id, folder.name);
                await props.onChanged();
              },
            },
            {
              key: "purge",
              icon: <Trash2 size={16} />,
              label: "Delete forever",
              confirm: PURGE_CONFIRM,
              onSelect: async () => {
                await purgeFolder(folder.id, folder.name);
                await props.onChanged();
              },
            },
          ]}
        />
      </div>
    </li>
  );
}
