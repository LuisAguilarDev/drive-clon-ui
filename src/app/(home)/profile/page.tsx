import { useEffect, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User as UserIcon } from "lucide-react";

import DeleteAccountModal from "~/components/delete-account-modal";
import { deleteAccount } from "~/lib/api/account";
import { useAuth } from "~/lib/keycloak/AuthProvider";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { initialized, authenticated, user, logout } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Redirige a sign-in si la sesión terminó.
  useEffect(() => {
    if (initialized && !authenticated) {
      navigate("/sign-in");
    }
  }, [initialized, authenticated, navigate]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">Loading…</div>
    );
  }
  if (!authenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  const displayName = user.name ?? user.email.split("@")[0];

  const handleConfirmDelete = async () => {
    await deleteAccount();
    // La cuenta queda anonimizada en el backend: cerramos sesión y volvemos al
    // inicio (keycloak.logout redirige a "/").
    logout();
  };

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/drive"
          className="mb-6 inline-flex items-center text-sm text-ink-muted hover:text-white"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to My Drive
        </Link>

        <h1 className="mb-6 text-2xl font-semibold text-white">Profile</h1>

        {/* Identidad */}
        <section className="mb-6 rounded-xl border border-line bg-surface p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-control text-white">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-medium text-white">
                {displayName}
              </p>
              <p className="truncate text-sm text-ink-muted">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Zona de peligro: cierre de cuenta */}
        <section className="rounded-xl border border-red-500/30 bg-surface p-6">
          <h2 className="text-lg font-medium text-red-400">Danger zone</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Deleting your account closes it for good and removes your personal
            information. You'll lose access to all your files and folders. This
            cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            Delete account
          </button>
        </section>
      </div>

      <DeleteAccountModal
        open={confirmingDelete}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
