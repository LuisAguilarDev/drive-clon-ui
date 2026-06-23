import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

// Palabra que el usuario debe teclear para habilitar el borrado (acción
// irreversible: una confirmación de un clic sería demasiado fácil de disparar).
const CONFIRM_WORD = "DELETE";

/**
 * Modal de confirmación para cerrar la cuenta. Pide teclear `DELETE` para
 * habilitar el botón. Se renderiza en un portal sobre `document.body`.
 */
export default function DeleteAccountModal(props: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resetea el estado cada vez que se abre.
  useEffect(() => {
    if (props.open) {
      setText("");
      setError(null);
      setBusy(false);
    }
  }, [props.open]);

  // Escape cierra (salvo durante el borrado en curso).
  useEffect(() => {
    if (!props.open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        props.onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [props.open, busy, props]);

  if (!props.open) {
    return null;
  }

  const confirmed = text.trim() === CONFIRM_WORD;

  const handleConfirm = async () => {
    if (!confirmed) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await props.onConfirm();
      // En éxito normalmente se cierra sesión y se redirige: no reseteamos.
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete account",
      );
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={() => {
        if (!busy) {
          props.onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <AlertTriangle size={20} />
          </span>
          <h2
            id="delete-account-title"
            className="text-lg font-semibold text-white"
          >
            Delete account
          </h2>
        </div>

        <p className="text-sm text-ink-muted">
          This permanently closes your account and removes your personal
          information. You'll lose access to all your files and folders. This
          can't be undone.
        </p>

        <label className="mt-4 block text-sm text-ink-muted">
          Type <span className="font-semibold text-ink">{CONFIRM_WORD}</span> to
          confirm
        </label>
        <input
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={busy}
          placeholder={CONFIRM_WORD}
          className="mt-2 w-full rounded-md border border-elevated bg-control px-3 py-2 text-sm text-ink outline-none focus:border-ink-faint disabled:opacity-50"
        />

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={props.onCancel}
            disabled={busy}
            className="rounded-md px-4 py-2 text-sm text-ink-muted hover:bg-elevated hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!confirmed || busy}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
