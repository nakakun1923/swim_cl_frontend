import React, { useState, useRef } from "react";
import { api } from "../services/api/client";

export const OcrInputTabs = ({ onOcrResult }: { onOcrResult: (values: string[]) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async (uploadFile?: File) => {
    const targetFile = uploadFile || file;
    if (!targetFile) return;
    setLoading(true);
    try {
      const res = await api.uploadOcrImage(targetFile);
      onOcrResult(res.values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center bg-white mt-4 mb-2 cursor-pointer hover:border-indigo-400 relative"
      >
        {/* ツールチップアイコン */}
        <div
          className="absolute top-2 right-2 z-10"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(v => !v)}
        >
          <span className="inline-block w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-lg font-bold border border-indigo-300 cursor-pointer select-none">？</span>
          {showTooltip && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-left text-xs z-20">
              <div className="font-bold text-indigo-700 mb-2">画像がうまく認識できない場合</div>
              <ul className="list-disc pl-5 mb-2 text-gray-700">
                <li>明るく、はっきり写っているか確認してください</li>
                <li>行ごとに認識します</li>
                <li>１ラップごとに縦書きでも認識します</li>
                <li>通過タイム以外はトリミングしてください</li>
                <li>()書きや50mといった距離はスキップしています</li>
              </ul>
              <div className="font-bold text-indigo-700 mb-1">悪い画像例</div>
              <img src="/public/bad_image.png" alt="悪い画像例" className="w-full rounded border" />
              <div className="font-bold text-indigo-700 mb-1">良い画像例</div>
              <img src="/public/good_image.png" alt="良い画像例1" className="w-full rounded mb-2 border" />
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
          onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') e.preventDefault(); }}
        />
        <div className="text-base text-gray-700">画像からラップを自動入力！</div>
        <div className="text-sm text-gray-500 mb-2">(ドラッグ＆ドロップ対応)</div>
        {file && <div className="mb-2 text-sm text-gray-700">選択中: {file.name}</div>}
        {loading ? "解析中..." : ""}
      </div>
    </div>
  );
}; 