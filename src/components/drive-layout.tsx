import type { ReactNode } from "react";

import DriveSidebar from "./drive-sidebar";

/**
 * Shell del área de Drive: barra lateral fija a la izquierda y contenido a la
 * derecha. Lo comparten el explorador de archivos y la papelera para mantener la
 * navegación (My Drive / Trash) siempre visible.
 */
export default function DriveLayout(props: {
  rootFolderId: number | null;
  children: ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen bg-black text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <DriveSidebar rootFolderId={props.rootFolderId} />
      <main className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-6xl">{props.children}</div>
      </main>
    </div>
  );
}
