import {
  Download,
  FileIcon,
  Folder as FolderIcon,
  Share2,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import RowMenu from "./row-menu";
import {
  deleteFile,
  deleteFolder,
  downloadFile,
  downloadFolder,
  formatBytes,
  type DriveFile,
  type FolderSummary,
} from "~/lib/api/files";

// Confirmación del borrado: ahora es soft delete = mover a la papelera.
const TRASH_CONFIRM = {
  prompt: "Move to trash?",
  confirmLabel: "Move",
  busyLabel: "Moving…",
};

// Rejilla compartida por la cabecera y las filas: Nombre | Propietario | Tamaño.
export const ROW_GRID = "grid grid-cols-[1fr_180px_140px] items-center";

// Iconos de fichero/carpeta: el trazo hereda el color del texto (currentColor).
const iconClass = "shrink-0 text-ink-muted";

const rowClass = `group relative h-14 px-[22px] transition-[background] duration-[120ms] hover:bg-row-hover ${ROW_GRID}`;
const secondaryCell = "text-[14px] text-ink-subtle";

export function FileRow(props: {
  file: DriveFile;
  onChanged: () => void | Promise<void>;
}) {
  const { file } = props;
  // "me" cuando el usuario actual es el propietario (lo decide el backend).
  const ownerLabel = file.owner.is_me ? "me" : file.owner.name || "—";
  return (
    <li className={rowClass}>
      <div className="flex min-w-0 items-center gap-[14px] text-[15px] text-ink">
        <FileIcon size={18} className={iconClass} />
        <span className="truncate">{file.name}</span>
      </div>
      <div className={secondaryCell}>{ownerLabel}</div>
      <div className={`${secondaryCell} tabular-nums`}>
        {formatBytes(file.size_bytes)}
      </div>
      <div className="absolute right-[10px] top-1/2 -translate-y-1/2">
        <RowMenu
          label={file.name}
          actions={[
            {
              key: "download",
              icon: <Download size={16} />,
              label: "Download",
              onSelect: () => downloadFile(file.id, file.name),
            },
            {
              key: "share",
              icon: <Share2 size={16} />,
              label: "Share",
              disabled: true,
              title: "Coming soon",
              onSelect: () => undefined,
            },
            {
              key: "delete",
              icon: <Trash2 size={16} />,
              label: "Delete",
              confirm: TRASH_CONFIRM,
              onSelect: async () => {
                await deleteFile(file.id, file.name);
                await props.onChanged();
              },
            },
          ]}
        />
      </div>
    </li>
  );
}

export function FolderRow(props: {
  folder: FolderSummary;
  onChanged: () => void | Promise<void>;
}) {
  const { folder } = props;
  return (
    <li className={rowClass}>
      <div className="flex min-w-0 items-center text-[15px] text-ink">
        <Link
          to={`/f/${folder.id}`}
          className="flex min-w-0 items-center gap-[14px] hover:text-white"
        >
          <FolderIcon size={18} className={iconClass} />
          <span className="truncate">{folder.name}</span>
        </Link>
      </div>
      <div className={secondaryCell}>—</div>
      <div className={`${secondaryCell} tabular-nums`}>—</div>
      <div className="absolute right-[10px] top-1/2 -translate-y-1/2">
        <RowMenu
          label={folder.name}
          actions={[
            {
              key: "download",
              icon: <Download size={16} />,
              label: "Download",
              onSelect: () => downloadFolder(folder.id, folder.name),
            },
            {
              key: "share",
              icon: <Share2 size={16} />,
              label: "Share",
              disabled: true,
              title: "Coming soon",
              onSelect: () => undefined,
            },
            {
              key: "delete",
              icon: <Trash2 size={16} />,
              label: "Delete",
              confirm: TRASH_CONFIRM,
              onSelect: async () => {
                await deleteFolder(folder.id, folder.name);
                await props.onChanged();
              },
            },
          ]}
        />
      </div>
    </li>
  );
}
