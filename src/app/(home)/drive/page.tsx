import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default async function DrivePage() {
  // const session = await auth();
  const session = {userId:"1"}
  if (!session.userId) {
    return redirect("/sign-in");
  }

  // const rootFolder = await QUERIES.getRootFolderForUser(session.userId);
  const rootFolder = undefined
  if (!rootFolder) {
    return (
      <form
        action={async () => {
          "use server";
          // const session = await auth();

          if (!session.userId) {
            return redirect("/sign-in");
          }

          // const rootFolderId = await MUTATIONS.onboardUser(session.userId);

          // return redirect(`/f/${rootFolderId}`);
        }}
      >
        <Button>Create new Drive</Button>
      </form>
    );
  }

  // return redirect(`/f/${rootFolder.id}`);
}
