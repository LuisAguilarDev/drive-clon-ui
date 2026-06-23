import { useState, type ReactNode } from "react";
import { UploadCloud } from "lucide-react";

import { cn } from "~/lib/utils";
import { useUploads } from "~/lib/hooks/use-uploads";

// Drop zone que envuelve el listado de ficheros. Resalta al arrastrar y, al
// soltar, sube cada fichero a la carpeta actual. Para elegir ficheros con un
// diálogo se usa el botón "New" de la cabecera.
export default function UploadDropzone(props: {
  folderId: number;
  onUploaded: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadAll, pending, error, isUploading } = useUploads(
    props.folderId,
    props.onUploaded,
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void uploadAll(event.dataTransfer.files);
      }}
      className={cn(
        "rounded-lg border-2 border-dashed transition-colors",
        isDragging ? "border-white bg-white/10" : "border-transparent",
      )}
    >
      {props.children}

      <div className="flex flex-col items-center gap-2 px-6 py-8 text-neutral-400">
        <UploadCloud size={28} />
        <p className="text-sm">
          {isDragging
            ? "Drop files to upload"
            : "Drag & drop files here, or use the New button"}
        </p>
        {isUploading && (
          <p className="text-sm text-neutral-400">
            Uploading {pending.length} file{pending.length > 1 ? "s" : ""}…
          </p>
        )}
        {error && <p className="text-sm text-white">{error}</p>}
      </div>
    </div>
  );
}
