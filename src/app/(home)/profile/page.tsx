import { useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User as UserIcon } from "lucide-react";

import { AppButton } from "~/components/ui/app-button";
import { useAuth } from "~/lib/keycloak/AuthProvider";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { initialized, authenticated, user } = useAuth();

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

  // La eliminación de cuenta se implementará más adelante.
  const handleDeleteAccount = () => {
    // TODO: conectar con el backend para eliminar la cuenta del usuario.
  };

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/drive"
          className="mb-6 inline-flex items-center text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to My Drive
        </Link>

        <h1 className="mb-6 text-2xl font-semibold text-white">Profile</h1>

        {/* Identidad */}
        <section className="mb-6 rounded-lg bg-gray-800 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-700 text-white">
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
              <p className="truncate text-sm text-neutral-400">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Zona de peligro: eliminación de cuenta */}
        <section className="rounded-lg border border-red-900/60 bg-gray-800 p-6 shadow-xl">
          <h2 className="text-lg font-medium text-white">Danger zone</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Deleting your account is permanent and removes all of your files and
            folders. This cannot be undone.
          </p>
          <AppButton
            type="button"
            disabled
            onClick={handleDeleteAccount}
            className="mt-4"
            title="Account deletion will be available soon"
          >
            Delete account
          </AppButton>
          <p className="mt-2 text-xs text-neutral-400">Coming soon.</p>
        </section>
      </div>
    </div>
  );
}
