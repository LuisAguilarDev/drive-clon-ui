"use client"
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { auth } from '../../../lib/firebase/firebaseConfig';

export default function DrivePage() {
  const user = auth.currentUser;
  if (!user) {
    return redirect("/sign-in");
  }

  // const rootFolder = await QUERIES.getRootFolderForUser(session.userId);
  const rootFolder = undefined
  if (!rootFolder) {
    return (
      <>
        <div className="text-center h-full flex items-center justify-center gap-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-center">Welcome, {user.email}!</h2>
          <button
            onClick={() => { auth.signOut(); redirect("/sign-in") }}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
        <form
          action={async () => {
            if (!user) {
              return redirect("/sign-in");
            }

            // const rootFolderId = await MUTATIONS.onboardUser(session.userId);

            // return redirect(`/f/${rootFolderId}`);
          }}
        >
          <Button>Create new Folder</Button>
        </form>
      </>
    );
  }

  // return redirect(`/f/${rootFolder.id}`);
}
