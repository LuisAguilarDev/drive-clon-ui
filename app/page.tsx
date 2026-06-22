'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  X, 
  FileText, 
  Image, 
  Film, 
  Music, 
  Archive, 
  Database, 
  FileCode, 
  FilePlus,
  Home,
  Star,
  Clock,
  Trash2,
  HardDrive,
  Plus,
  FolderPlus,
  Menu,
  ChevronRight
} from 'lucide-react';

// Define file type for our application
interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: Date;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get appropriate icon based on file type
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
  if (fileType.startsWith('video/')) return <Film className="w-6 h-6 text-purple-500" />;
  if (fileType.startsWith('audio/')) return <Music className="w-6 h-6 text-pink-500" />;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) 
    return <Archive className="w-6 h-6 text-yellow-500" />;
  if (fileType.includes('json') || fileType.includes('csv') || fileType.includes('xml')) 
    return <Database className="w-6 h-6 text-green-500" />;
  if (fileType.includes('html') || fileType.includes('css') || fileType.includes('javascript')) 
    return <FileCode className="w-6 h-6 text-indigo-500" />;
  
  return <FileText className="w-6 h-6 text-gray-500" />;
};

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('my-files');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileItem[] = [];
    let newStorageSize = storageUsed;
    
    Array.from(fileList).forEach(file => {
      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });
      newStorageSize += file.size;
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    setStorageUsed(newStorageSize);
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find(file => file.id === id);
    if (fileToRemove) {
      setStorageUsed(prev => prev - fileToRemove.size);
    }
    setFiles(files.filter(file => file.id !== id));
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate storage percentage
  const storageLimit = 15 * 1024 * 1024 * 1024; // 15GB like Google Drive
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <File className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">FileVault</h1>
          </div>
        </div>
        <div>
          <button
            onClick={openFileSelector}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-white shadow-md transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          <div className="p-4">
            <button
              onClick={openFileSelector}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-full transition-colors w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Upload</span>
            </button>
          </div>

          <nav className="mt-2">
            <ul>
              <li>
                <button 
                  onClick={() => setActiveSection('my-files')}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 ${
                    activeSection === 'my-files' 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>My Files</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('starred')}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 ${
                    activeSection === 'starred' 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  <span>Starred</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('recent')}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 ${
                    activeSection === 'recent' 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>Recent</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('trash')}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 ${
                    activeSection === 'trash' 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Trash</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="px-4 mt-8">
            <div className="text-sm text-gray-500 mb-2 flex justify-between">
              <span>Storage</span>
              <span>{formatFileSize(storageUsed)} of {formatFileSize(storageLimit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeSection === 'my-files' && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">My Files</h2>
                <div className="flex gap-2">
                  <button className="text-gray-600 hover:text-blue-600 transition-colors">
                    <FolderPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Drag & Drop Files Here
                </h2>
                <p className="text-gray-500 mb-4">
                  or
                </p>
                <button
                  onClick={openFileSelector}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Browse Files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  className="hidden"
                  multiple
                />
                <p className="text-sm text-gray-500 mt-4">
                  Supported file types: Images, Documents, Videos, and more
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">Uploaded Files ({files.length})</h3>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(storageUsed)} used
                    </div>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {files.map(file => (
                      <li key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <p className="font-medium text-gray-800">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)} • {file.lastModified.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty State */}
              {files.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <FilePlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No files uploaded yet</h3>
                  <p className="text-gray-500">
                    Upload files by dragging & dropping them above or using the browse button
                  </p>
                </div>
              )}
            </>
          )}

          {activeSection === 'starred' && (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No starred files</h3>
              <p className="text-gray-500">
                Star important files to access them quickly
              </p>
            </div>
          )}

          {activeSection === 'recent' && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No recent files</h3>
              <p className="text-gray-500">
                Recently accessed files will appear here
              </p>
            </div>
          )}

          {activeSection === 'trash' && (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Trash is empty</h3>
              <p className="text-gray-500">
                Deleted files will appear here for 30 days
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}