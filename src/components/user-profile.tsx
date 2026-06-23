import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";

import { useAuth } from "~/lib/keycloak/AuthProvider";
import { useDropdown } from "~/lib/hooks/use-dropdown";
import { cn } from "~/lib/utils";

/**
 * Avatar circular del usuario. Muestra su foto de Keycloak y cae a un icono
 * por defecto cuando no hay foto o la imagen falla al cargar.
 */
function Avatar(props: { picture?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = props.picture && !failed;

  return (
    <span
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-gray-700 text-white",
        props.className,
      )}
    >
      {showImage ? (
        <img
          src={props.picture}
          alt={props.alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <UserIcon className="h-1/2 w-1/2" />
      )}
    </span>
  );
}

/**
 * Botón de perfil para la barra de navegación. Al hacer clic despliega un menú
 * con el email del usuario, un enlace a "View profile" y el botón "Sign out".
 */
export default function UserProfile() {
  const { user, logout } = useAuth();
  const { open, setOpen, ref: containerRef } = useDropdown<HTMLDivElement>();

  if (!user) {
    return null;
  }

  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className="rounded-full ring-offset-2 ring-offset-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Avatar
          picture={user.picture}
          alt={displayName}
          className="h-10 w-10"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-line bg-panel shadow-xl"
        >
          {/* Identidad del usuario */}
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <Avatar
              picture={user.picture}
              alt={displayName}
              className="h-10 w-10 shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-neutral-400">{user.email}</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="py-1">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-elevated"
            >
              <UserIcon size={16} />
              View profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-ink hover:bg-elevated"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
