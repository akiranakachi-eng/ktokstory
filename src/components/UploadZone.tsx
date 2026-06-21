"use client";

import { useCallback, useState } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div
      className={`upload-zone rounded-2xl p-1 relative overflow-hidden ${dragging ? "dragging" : ""} ${disabled ? "opacity-50" : ""}`}
      onDrop={disabled ? undefined : (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
      onDragOver={disabled ? undefined : (e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
    >
      {/* Transparent full-area file input — most reliable on iOS */}
      {!disabled && (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            zIndex: 10,
          }}
        />
      )}

      {preview ? (
        <div className="relative w-full aspect-square max-h-72 rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="アップロード画像"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 text-xs text-white/70">タップして変更</div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
          <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center animate-pulse-glow">
            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">画像をアップロード</p>
            <p className="text-white/50 text-sm">タップしてカメラ撮影・ファイル選択</p>
            <p className="text-white/30 text-xs mt-2">JPG・PNG・WebP / 最大20MB</p>
          </div>
        </div>
      )}
    </div>
  );
}
