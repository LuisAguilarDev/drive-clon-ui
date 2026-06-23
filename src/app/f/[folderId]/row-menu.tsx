import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, MoreVertical, Share2, Trash2 } from "lucide-react";

// Distancia (px) entre el botón y el menú desplegado.
const MENU_GAP = 4;

/**
 * Menú de acciones por fila (icono de tres puntos). El panel se renderiza en un
 * portal sobre `document.body` para que no lo recorte el `overflow:hidden` de la
 * tabla y para que pasar el ratón por él no active el hover de la fila.
 *
 * "Download" y "Delete" están habilitados; "Delete" pide confirmación en el
 * propio menú (sin diálogos nativos). "Share" queda deshabilitado hasta que se
 * implemente.
 */
export default function RowMenu(props: {
  /** Etiqueta accesible, p. ej. el nombre del fichero o carpeta. */
  label: string;
  onDownload: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Confirmación en dos pasos del borrado (operación destructiva).
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Posición fija del panel, anclada bajo el botón y alineada a su derecha.
  const [position, setPosition] = useState<{ top: number; right: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + MENU_GAP,
      right: window.innerWidth - rect.right,
    });
  };

  const close = () => {
    setOpen(false);
    setConfirmingDelete(false);
  };

  const toggle = () => {
    if (!open) {
      updatePosition();
      setConfirmingDelete(false);
    }
    setOpen((value) => !value);
  };

  // Cierra al hacer clic fuera (botón + panel) o pulsar Escape; al hacer scroll o
  // redimensionar se cierra para no quedar desanclado del botón.
  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    const handleReposition = () => close();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  const handleDownload = async () => {
    close();
    setDownloading(true);
    try {
      await props.onDownload();
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await props.onDelete();
      close();
    } finally {
      setDeleting(false);
    }
  };

  const itemClass =
    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink hover:bg-elevated";
  const disabledItemClass =
    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-subtle cursor-not-allowed";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${props.label}`}
        disabled={downloading}
        className="rounded p-1 text-ink-muted hover:bg-elevated hover:text-white disabled:opacity-50"
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: position.top, right: position.right }}
            className="z-[1000] w-44 overflow-hidden rounded-lg border border-line bg-panel shadow-xl"
          >
            {confirmingDelete ? (
              <div className="p-3">
                <p className="mb-3 text-sm text-ink">Delete permanently?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deleting}
                    className="flex-1 rounded border border-elevated bg-control px-3 py-1.5 text-sm text-white hover:bg-elevated disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    className="flex-1 rounded px-3 py-1.5 text-sm text-ink-muted hover:bg-elevated hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleDownload()}
                  className={itemClass}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled
                  title="Coming soon"
                  className={disabledItemClass}
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setConfirmingDelete(true)}
                  className={itemClass}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
