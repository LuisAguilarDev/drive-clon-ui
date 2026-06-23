import { HardDrive, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "~/lib/utils";

/**
 * Barra lateral del área de Drive: navega entre "My Drive" (archivos actuales)
 * y "Trash" (papelera). El destino activo se resalta según la URL.
 *
 * `rootFolderId` puede ser null mientras se resuelve la raíz; en ese caso "My
 * Drive" cae a `/drive`, que redirige a la raíz una vez disponible.
 */
export default function DriveSidebar(props: { rootFolderId: number | null }) {
  const { pathname } = useLocation();
  const onTrash = pathname === "/trash";
  // Cualquier vista que no sea la papelera es navegación dentro de "My Drive".
  const onDrive = !onTrash;

  const itemBase =
    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors";
  const activeItem = "bg-control text-white";
  const inactiveItem = "text-ink-muted hover:bg-row-hover hover:text-white";

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-line bg-panel px-3 py-6">
      <div className="mb-4 flex items-center gap-2 px-3">
        <img
          src="/favicon.ico"
          alt="TerraNova Drive logo"
          className="h-7 w-7 shrink-0 rounded-full bg-white p-1"
        />
        <span className="text-lg font-semibold text-white">TerraNova Drive</span>
      </div>
      <Link
        to={props.rootFolderId ? `/f/${props.rootFolderId}` : "/drive"}
        className={cn(itemBase, onDrive ? activeItem : inactiveItem)}
      >
        <HardDrive size={18} />
        My Drive
      </Link>
      <Link
        to="/trash"
        className={cn(itemBase, onTrash ? activeItem : inactiveItem)}
      >
        <Trash2 size={18} />
        Trash
      </Link>
    </aside>
  );
}
