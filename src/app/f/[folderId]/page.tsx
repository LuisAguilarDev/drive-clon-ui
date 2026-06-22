import { useParams } from "react-router-dom";
import DriveContents from "./drive-contents";

type DriveFolder = { id: string; name: string };
type DriveFile = { id: string; url: string; name: string; size: string };

export default function GoogleDriveClone() {
  const { folderId } = useParams<{ folderId: string }>();

  const parsedFolderId = parseInt(folderId ?? "", 10);
  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>;
  }

  // Data fetching is not wired up yet — render with empty collections.
  const folders: DriveFolder[] = [];
  const files: DriveFile[] = [];
  const parents: DriveFolder[] = [];

  return (
    <DriveContents
      files={files}
      folders={folders}
      parents={parents}
      currentFolderId={parsedFolderId}
    />
  );
}
