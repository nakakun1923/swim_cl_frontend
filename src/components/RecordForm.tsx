import React, { useState, useEffect } from "react";
import { OcrInputTabs } from "./OcrInputTabs";

const STYLE_NAMES: { [key: number]: string } = {
  1: "自由形",
  2: "背泳ぎ",
  3: "平泳ぎ",
  4: "バタフライ",
  5: "個人メドレー",
};
const DISTANCE_NAMES: { [key: number]: string } = {
  1: "50m",
  2: "100m",
  3: "200m",
  4: "400m",
  5: "800m",
  6: "1500m",
};
const DISTANCE_LAPS: { [key: number]: number } = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
  6: 30,
};

export interface RecordFormData {
  date: string;
  style_id: number;
  distance_id: number;
  is_short_course: boolean;
  memo: string;
  lap_times: string[];
}

interface RecordFormProps {
  mode: "create" | "edit";
  initialData: RecordFormData;
  onSubmit: (data: RecordFormData) => void;
  isProcessing?: boolean;
  error?: string | null;
}

export const RecordForm: React.FC<RecordFormProps> = ({ mode, initialData, onSubmit, isProcessing, error }) => {
  const [formData, setFormData] = useState<RecordFormData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, []);

  const updateFormData = (field: keyof RecordFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === "distance_id") {
        const newDistanceId = value as number;
        const expectedLaps = DISTANCE_LAPS[newDistanceId] || 1;
        const currentLaps = newData.lap_times.length;
        if (currentLaps < expectedLaps) {
          for (let i = 0; i < expectedLaps - currentLaps; i++) {
            newData.lap_times.push("00:00.00");
          }
        } else if (currentLaps > expectedLaps) {
          newData.lap_times = newData.lap_times.slice(0, expectedLaps);
        }
      }
      return newData;
    });
  };

  const updateLapTime = (lapIndex: number, value: string) => {
    setFormData(prev => {
      const newLapTimes = [...prev.lap_times];
      newLapTimes[lapIndex] = value;
      return { ...prev, lap_times: newLapTimes };
    });
  };

  const handleOcrResult = (values: string[]) => {
    setFormData(prev => ({
      ...prev,
      lap_times: values
        .map((v, i) => {
          if (i === 0 && /^\d{1,2}\.\d{2}$/.test(v)) {
            return `0:${v}`;
          }
          return v;
        })
        .filter(v => /^\d{1,2}:\d{2}\.\d{2}$/.test(v))
        .map(v => {
          const [min, rest] = v.split(":");
          const [sec, ms = "00"] = rest.split(".");
          const mm = min.padStart(2, "0");
          const ss = sec.padStart(2, "0");
          const mms = ms.padEnd(2, "0");
          return `${mm}:${ss}.${mms}`;
        })
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RecordForm submit', e, e.nativeEvent);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-red-600 text-xs mb-1">{error}</div>}
      {/* スマホ用（小画面） */}
      <div className="block lg:hidden">
        <div className="flex flex-row gap-1 w-full">
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">日付</label>
            <input type="date" value={formData.date} onChange={e => updateFormData('date', e.target.value)} className="w-28 border rounded px-1 py-0.5 text-xs" required />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">種目</label>
            <select value={formData.style_id} onChange={e => updateFormData('style_id', parseInt(e.target.value))} className="w-28 border rounded px-1 py-0.5 text-xs">
              {Object.entries(STYLE_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">距離</label>
            <select value={formData.distance_id} onChange={e => updateFormData('distance_id', parseInt(e.target.value))} className="w-20 border rounded px-1 py-0.5 text-xs">
              {Object.entries(DISTANCE_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-row gap-1 w-full mt-1">
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">コース</label>
            <select value={formData.is_short_course ? 'true' : 'false'} onChange={e => updateFormData('is_short_course', e.target.value === 'true')} className="w-20 border rounded px-1 py-0.5 text-xs">
              <option value="true">短水路</option>
              <option value="false">長水路</option>
            </select>
          </div>
          <div className="w-40">
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">メモ</label>
            <input type="text" value={formData.memo} onChange={e => updateFormData('memo', e.target.value)} className="border rounded px-1 py-0.5 text-xs w-full" />
          </div>
        </div>
      </div>
      {/* PC用（lg以上） */}
      <div className="hidden lg:flex flex-row gap-1 items-end w-full">
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">日付</label>
          <input type="date" value={formData.date} onChange={e => updateFormData('date', e.target.value)} className="w-28 border rounded px-1 py-0.5 text-xs" required />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">種目</label>
          <select value={formData.style_id} onChange={e => updateFormData('style_id', parseInt(e.target.value))} className="w-28 border rounded px-1 py-0.5 text-xs">
            {Object.entries(STYLE_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-row gap-0 items-end">
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">距離</label>
            <select value={formData.distance_id} onChange={e => updateFormData('distance_id', parseInt(e.target.value))} className="w-20 border rounded px-1 py-0.5 text-xs">
              {Object.entries(DISTANCE_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">コース</label>
            <select value={formData.is_short_course ? 'true' : 'false'} onChange={e => updateFormData('is_short_course', e.target.value === 'true')} className="w-20 border rounded px-1 py-0.5 text-xs">
              <option value="true">短水路</option>
              <option value="false">長水路</option>
            </select>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">メモ</label>
          <input type="text" value={formData.memo} onChange={e => updateFormData('memo', e.target.value)} className="border rounded px-1 py-0.5 text-xs w-full flex-1 min-w-0" />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-medium text-gray-700 mb-0.5">ラップタイム</label>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-0.5 py-0.5">ラップ</th>
                <th className="px-0.5 py-0.5">タイム</th>
              </tr>
            </thead>
            <tbody>
              {formData.lap_times.map((lapTime, lapIndex) => (
                <tr key={lapIndex}>
                  <td className="px-0.5 py-0.5 text-center">{(lapIndex + 1) * 50}m</td>
                  <td className="px-0.5 py-0.5 text-center">
                    <input
                      value={lapTime}
                      onChange={e => updateLapTime(lapIndex, e.target.value)}
                      className="w-16 border rounded px-1 py-0.5 text-xs text-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <OcrInputTabs onOcrResult={handleOcrResult} />
      </div>
      <div className="flex justify-end gap-2">
        {(mode === "edit" || mode === "create") && (
          <button
            type="submit"
            disabled={isProcessing}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (mode === "edit" ? "更新中..." : "登録中...") : (mode === "edit" ? "更新" : "登録")}
          </button>
        )}
      </div>
    </form>
  );
}; 