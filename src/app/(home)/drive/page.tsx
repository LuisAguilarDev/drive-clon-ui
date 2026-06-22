import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { auth } from "../../../lib/firebase/firebaseConfig";

export default function DrivePage() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/sign-in");
  };

  return (
    <>
      <div className="text-center h-full flex items-center justify-center gap-4">
        <h2 className="text-sm font-bold text-white flex items-center justify-center">
          Welcome, {user.email}!
        </h2>
        <button
          onClick={handleSignOut}
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
