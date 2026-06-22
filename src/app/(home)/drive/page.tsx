import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/lib/keycloak/AuthProvider";

export default function DrivePage() {
  const navigate = useNavigate();
  const { initialized, authenticated, user, organization, logout } = useAuth();

  useEffect(() => {
    if (initialized && !authenticated) {
      navigate("/sign-in");
    }
  }, [initialized, authenticated, navigate]);

  if (!initialized) {
    return <p className="text-neutral-400">Loading…</p>;
  }

  if (!authenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <>
      <div className="text-center h-full flex items-center justify-center gap-4">
        <h2 className="text-sm font-bold text-white flex items-center justify-center">
          Welcome, {user?.email}!
          {organization ? ` · ${organization.name}` : ""}
        </h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // const rootFolderId = await MUTATIONS.onboardUser(user.uid);
          // navigate(`/f/${rootFolderId}`);
        }}
      >
        <Button type="submit">Create new Folder</Button>
      </form>
    </>
  );
}
