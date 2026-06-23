import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

// Distancia (px) entre el botón y el menú desplegado.
const MENU_GAP = 4;

/** Una acción del menú de fila. Si trae `confirm`, pide confirmación en dos
 * pasos dentro del propio panel (para operaciones destructivas). */
export interface RowAction {
  key: string;
  icon: ReactNode;
  label: string;
  onSelect: () => void | Promise<void>;
  /** Deshabilita la acción (p. ej. "Share — Coming soon"). */
  disabled?: boolean;
  title?: string;
  confirm?: { prompt: string; confirmLabel: string; busyLabel: string };
}

/**
 * Menú de acciones por fila (icono de tres puntos). El panel se renderiza en un
 * portal sobre `document.body` para que no lo recorte el `overflow:hidden` de la
 * tabla y para que pasar el ratón por él no active el hover de la fila.
 *
 * Es genérico: recibe la lista de acciones, así lo comparten el explorador
 * (Download/Share/Delete) y la papelera (Restore/Delete forever).
 */
export default function RowMenu(props: { label: string; actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // Clave de la acción en confirmación (null = mostrando la lista del menú).
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
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
    setConfirmingKey(null);
  };

  const toggle = () => {
    if (!open) {
      updatePosition();
      setConfirmingKey(null);
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

  const runAction = async (action: RowAction) => {
    setBusy(true);
    try {
      await action.onSelect();
      close();
    } finally {
      setBusy(false);
    }
  };

  const handleSelect = (action: RowAction) => {
    if (action.disabled) {
      return;
    }
    if (action.confirm) {
      setConfirmingKey(action.key);
      return;
    }
    void runAction(action);
  };

  const itemClass =
    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink hover:bg-elevated";
  const disabledItemClass =
    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink-subtle cursor-not-allowed";

  const confirming = props.actions.find((action) => action.key === confirmingKey);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${props.label}`}
        disabled={busy}
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
            className="z-[1000] w-48 overflow-hidden rounded-lg border border-line bg-panel shadow-xl"
          >
            {confirming && confirming.confirm ? (
              <div className="p-3">
                <p className="mb-3 text-sm text-ink">{confirming.confirm.prompt}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void runAction(confirming)}
                    disabled={busy}
                    className="flex-1 rounded border border-elevated bg-control px-3 py-1.5 text-sm text-white hover:bg-elevated disabled:opacity-50"
                  >
                    {busy
                      ? confirming.confirm.busyLabel
                      : confirming.confirm.confirmLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingKey(null)}
                    disabled={busy}
                    className="flex-1 rounded px-3 py-1.5 text-sm text-ink-muted hover:bg-elevated hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              props.actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  role="menuitem"
                  disabled={action.disabled}
                  title={action.title}
                  onClick={() => handleSelect(action)}
                  className={action.disabled ? disabledItemClass : itemClass}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
