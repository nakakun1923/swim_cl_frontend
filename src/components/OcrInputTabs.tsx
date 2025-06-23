import React, { useState, useRef } from "react";
import { api } from "../services/api/client";

export const OcrInputTabs = ({ onOcrResult }: { onOcrResult: (values: string[]) => void }) => {
  const [tab, setTab] = useState<"manual" | "image">("manual");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await api.uploadOcrImage(file);
      onOcrResult(res.values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex mb-2">
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`flex-1 py-1 rounded-t-md border-b-2 ${tab === "manual" ? "bg-indigo-100 border-indigo-500 text-indigo-700 font-bold" : "bg-gray-100 border-gray-300 text-gray-500"}`}
        >
          手入力
        </button>
        <button
          type="button"
          onClick={() => setTab("image")}
          className={`flex-1 py-1 rounded-t-md border-b-2 ${tab === "image" ? "bg-indigo-100 border-indigo-500 text-indigo-700 font-bold" : "bg-gray-100 border-gray-300 text-gray-500"}`}
        >
          画像入力
        </button>
      </div>
      {tab === "manual" ? (null) : (
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center bg-white mb-2 cursor-pointer hover:border-indigo-400"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2"
            onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') e.preventDefault(); }}
          />
          <div className="text-xs text-gray-500 mb-2">ここに画像をドラッグ＆ドロップしてもOK</div>
          {file && <div className="mb-2 text-sm text-gray-700">選択中: {file.name}</div>}
          <button
            type="button"
            onClick={e => { e.preventDefault(); handleUpload(); }}
            disabled={!file || loading}
            className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
          >
            {loading ? "解析中..." : "画像で自動入力"}
          </button>
        </div>
      )}
    </div>
  );
}; 