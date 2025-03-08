"use client";

import { Upload, ChevronRight } from "lucide-react";
import { FileRow, FolderRow } from "./file-row";
import Link from "next/link";
import { UploadButton } from "~/components/uploadthing";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { auth } from '~/lib/firebase/firebaseConfig';
import { useEffect } from 'react';
export default function DriveContents(props: {
  files: { id: string, url: string, name: string, size: string }[];//(typeof files_table.$inferSelect)[];
  folders: { id: string, name: string }[];// (typeof folders_table.$inferSelect)[];
  parents: { id: string, name: string }[];//(typeof folders_table.$inferSelect)[];

  currentFolderId: number;
}): JSX.Element {
  const navigate = useRouter();

  const posthog = usePostHog();
  const user = auth.currentUser;
  useEffect(() => {
    if (!user) {
      navigate.push("/sign-in");
    }
  }, [user, navigate]);
  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/f/1" className="mr-2 text-gray-300 hover:text-white">
              My Drive
            </Link>
            {props.parents.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                <ChevronRight className="mx-2 text-gray-500" size={16} />
                <Link
                  href={`/f/${folder.id}`}
                  className="text-gray-300 hover:text-white"
                >
                  {folder.name}
                </Link>
              </div>
            ))}
          </div>
          <div className='flex items-center gap-4'>
            <h2 className="text-sm text-white flex items-center justify-center">Welcome, {user!.email?.split("@")[0] ?? "new user"}!</h2>
            <button
              onClick={() => auth.signOut()}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 h-10"
            >
              Sign Out
            </button>
            {/* <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn> */}
          </div>
        </div>
        <div className="rounded-lg bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          <ul>
            {props.folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} />
            ))}
            {props.files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </ul>
        </div>
        <UploadButton
          endpoint="driveUploader"
          onBeforeUploadBegin={(files) => {
            posthog.capture("files_uploading", {
              fileCount: files.length,
            });

            return files;
          }}
          onClientUploadComplete={() => {
            navigate.refresh();
          }}
          input={{
            folderId: props.currentFolderId,
          }}
        />
      </div>
    </div>
  );
}
