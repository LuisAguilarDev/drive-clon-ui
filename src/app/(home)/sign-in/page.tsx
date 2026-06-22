import { Navigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/lib/keycloak/AuthProvider";

const SignInPage = () => {
  const { initialized, authenticated, login } = useAuth();

  if (!initialized) {
    return <p className="text-neutral-400">Loading…</p>;
  }

  if (authenticated) {
    return <Navigate to="/drive" replace />;
  }

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold text-white">Sign in</h1>
      <p className="mx-auto mb-8 max-w-md text-neutral-400">
        Continue to TerraNova Drive with your Google account.
      </p>
      <Button
        size="lg"
        type="button"
        onClick={() => login({ idpHint: "google", redirectTo: "/drive" })}
        className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
      >
        Continue with Google
      </Button>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} TerraNova Drive. All rights reserved.
      </footer>
    </>
  );
};

export default SignInPage;
