'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadZoneProps {
  onFileSelect?: (file: File) => void;
  acceptedFormats?: string[];
}

export default function UploadZone({
  onFileSelect,
  acceptedFormats = ['PDF', 'EPUB'],
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptString = acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(',');

  const handleFile = useCallback(
    (file: File) => {
      if (onFileSelect) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        py-14 px-8 rounded-lg cursor-pointer
        border-2 border-dashed transition-all duration-300
        ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Upload Icon */}
      <div
        className={`
          w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-6
          transition-transform duration-300
          ${isDragging ? 'scale-110' : ''}
        `}
      >
        <svg
          className={`w-7 h-7 text-slate-500 transition-transform duration-500 ${
            isDragging ? '-translate-y-1' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>

      <p
        className="text-xl text-slate-700 mb-2"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Drag and drop your research paper here
      </p>
      <p className="text-xs font-medium tracking-[0.15em] text-slate-400 uppercase mb-4">
        Or click to browse from your device
      </p>
      <p className="text-[10px] font-medium tracking-[0.15em] text-slate-400 uppercase">
        Accepted formats: {acceptedFormats.join(', ')}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload research paper"
      />
    </div>
  );
}
