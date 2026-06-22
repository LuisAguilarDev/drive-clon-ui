import { useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { auth } from "../../lib/firebase/firebaseConfig";

export default function HomePage() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleGetStarted = () => {
    navigate(user ? "/drive" : "/sign-in");
  };

  return (
    <>
      <h1 className="mb-4 bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
        TerraNova Drive
      </h1>
      <p className="mx-auto mb-8 max-w-md text-xl text-neutral-400 md:text-2xl">
        Bright, fast, and secure cloud storage for all your needs.
      </p>
      <Button
        size="lg"
        type="button"
        onClick={handleGetStarted}
        className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
      >
        Get Started
      </Button>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} TerraNova Drive. All rights reserved.
      </footer>
    </>
  );
}
