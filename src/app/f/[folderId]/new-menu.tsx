import { useEffect, useRef } from "react";
import {
  ChevronDown,
  FileUp,
  FolderPlus,
  FolderUp,
  Plus,
} from "lucide-react";

import { AppButton } from "~/components/ui/app-button";
import { useDropdown } from "~/lib/hooks/use-dropdown";
import { useUploads } from "~/lib/hooks/use-uploads";

/**
 * Botón "New" con menú desplegable: crear carpeta, subir archivos o subir una
 * carpeta completa. Concentra las acciones de creación/subida de la vista.
 */
export default function NewMenu(props: {
  currentFolderId: number;
  /** Abre el formulario de nombre para crear una carpeta vacía. */
  onNewFolder: () => void;
  /** Recarga el listado tras una subida. */
  onChanged: () => void | Promise<void>;
}) {
  const { open, setOpen, ref: containerRef } = useDropdown<HTMLDivElement>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const { uploadAll, uploadFolder, isUploading, error } = useUploads(
    props.currentFolderId,
    props.onChanged,
  );

  // `webkitdirectory` no es un atributo tipado en JSX; se aplica vía DOM.
  useEffect(() => {
    const input = folderInputRef.current;
    if (input) {
      input.setAttribute("webkitdirectory", "");
      input.setAttribute("directory", "");
    }
  }, []);

  const itemClass =
    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink hover:bg-elevated";

  return (
    <div ref={containerRef} className="relative">
      <AppButton
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isUploading}
      >
        <Plus size={18} />
        {isUploading ? "Uploading…" : "New"}
        <ChevronDown size={16} />
      </AppButton>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-panel shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              props.onNewFolder();
            }}
            className={itemClass}
          >
            <FolderPlus size={16} />
            New folder
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              fileInputRef.current?.click();
            }}
            className={itemClass}
          >
            <FileUp size={16} />
            Upload file
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              folderInputRef.current?.click();
            }}
            className={itemClass}
          >
            <FolderUp size={16} />
            Upload folder
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-white">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            void uploadAll(event.target.files);
          }
          event.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            void uploadFolder(event.target.files);
          }
          event.target.value = "";
        }}
      />
    </div>
  );
}
