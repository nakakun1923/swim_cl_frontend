import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api/client';
import type { Record, Lap } from '../types/record';
import { PageLayout } from '../components/PageLayout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// @ts-ignore
import 'jspdf-autotable';

const STYLE_NAMES: { [key: number]: string } = {
  1: '自由形',
  2: '背泳ぎ',
  3: '平泳ぎ',
  4: 'バタフライ',
  5: '個人メドレー',
};

const DISTANCE_NAMES: { [key: number]: string } = {
  1: '50m',
  2: '100m',
  3: '200m',
  4: '400m',
  5: '800m',
  6: '1500m',
};

interface RecordWithLaps {
  record: Record;
  laps: Lap[];
}

export const BestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<RecordWithLaps[]>([]);
  const [error, _setError] = useState<string | null>(null);
  const [isShortCourse, setIsShortCourse] = useState(true);
  const [expandedStyles, setExpandedStyles] = useState<{ [key: number]: boolean }>({});
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        if (!currentUser) return;
        const response = await api.getRecordsByUserUUID(currentUser.uuid);
        if (response.data) {
          // 型を変換
          const convertedRecords: RecordWithLaps[] = response.data.map((item: any) => ({
            record: {
              id: item.record.id,
              user_id: item.record.user_id,
              style_id: item.record.style_id,
              distance_id: item.record.distance_id,
              date: item.record.date,
              is_short_course: item.record.is_short_course,
              memo: item.record.memo,
              created_at: item.record.created_at,
              updated_at: item.record.updated_at,
              laps: item.laps, // Record型にlapsフィールドを追加
            },
            laps: item.laps,
          }));
          setRecords(convertedRecords);
        }
      } catch (error) {
        console.error('記録の取得に失敗しました:', error);
      }
    };

    fetchRecords();
  }, [currentUser]);

  const calculateTotalTime = (laps: Lap[]) => {
    if (laps.length === 0) return 0;
    
    // 最終ラップのタイムを取得
    const lastLap = laps[laps.length - 1];
    const [_hoursStr, minutesStr, secondsStr] = lastLap.lap_time.split(':');
    const [secStr, msStr = '0'] = (secondsStr || '').split('.');
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secStr, 10) || 0;
    const ms = parseInt(msStr, 10) || 0;
    
    return minutes * 60 + seconds + ms / 100;
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`;
  };

  // ベスト記録を抽出
  const bestRecords = records.reduce((acc: RecordWithLaps[], current) => {
    if (current.record.is_short_course !== isShortCourse) {
      return acc;
    }

    const existingRecord = acc.find(r => 
      r.record.style_id === current.record.style_id &&
      r.record.distance_id === current.record.distance_id
    );

    if (!existingRecord) {
      return [...acc, current];
    }

    const currentTime = calculateTotalTime(current.laps);
    const existingTime = calculateTotalTime(existingRecord.laps);

    if (currentTime < existingTime) {
      return acc.map(r => 
        r.record.style_id === current.record.style_id &&
        r.record.distance_id === current.record.distance_id
          ? current
          : r
      );
    }

    return acc;
  }, []);

  // 全種目・全距離の組み合わせを生成
  const allCombinations = Object.keys(STYLE_NAMES).flatMap(styleId => {
    const styleIdNum = parseInt(styleId);
    let allowedDistances: number[];

    if (styleIdNum === 1) { // クロール
      allowedDistances = [1, 2, 3, 4, 5, 6]; // 全距離
    } else if (styleIdNum === 5) { // 個人メドレー
      allowedDistances = [2, 3, 4]; // 100, 200, 400
    } else { // その他の種目
      allowedDistances = [1, 2, 3]; // 50, 100, 200
    }

    return allowedDistances.map(distanceId => ({
      style_id: styleIdNum,
      distance_id: distanceId
    }));
  });

  // ベスト記録がない組み合わせも含めて表示
  const displayRecords = allCombinations.map(combo => {
    const bestRecord = bestRecords.find(r => 
      r.record.style_id === combo.style_id &&
      r.record.distance_id === combo.distance_id
    );

    return {
      style_id: combo.style_id,
      distance_id: combo.distance_id,
      record: bestRecord
    };
  });

  // 種目ごとに記録をグループ化
  const groupedRecords = displayRecords.reduce((acc: { [key: number]: typeof displayRecords }, record) => {
    if (!acc[record.style_id]) {
      acc[record.style_id] = [];
    }
    acc[record.style_id].push(record);
    return acc;
  }, {});

  const toggleStyle = (styleId: number) => {
    setExpandedStyles(prev => ({
      ...prev,
      [styleId]: !prev[styleId]
    }));
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    // すべての種目を展開
    const allExpanded = Object.keys(STYLE_NAMES).reduce((acc, styleId) => ({
      ...acc,
      [styleId]: true
    }), {});
    setExpandedStyles(allExpanded);

    // 少し待ってからPDFを生成（展開アニメーションの完了を待つ）
    setTimeout(async () => {
      try {
        const element = contentRef.current;
        if (!element) return;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        let currentPage = 1;
        let yOffset = 0;
        const pageHeight = 297; // A4の高さ（mm）
        const margin = 10; // 上下の余白

        // 各セクションを個別にキャプチャ
        for (const styleId of Object.keys(STYLE_NAMES)) {
          const section = element.querySelector(`[data-style-id="${styleId}"]`);
          if (!section) continue;

          const canvas = await html2canvas(section as HTMLElement, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 800
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const imgWidth = 190; // 左右の余白を考慮
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // 現在のページに収まらない場合は新しいページを追加
          if (yOffset + imgHeight > pageHeight - margin * 2) {
            pdf.addPage();
            currentPage++;
            yOffset = margin;
          }

          pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight);
          yOffset += imgHeight + 5; // セクション間の余白
        }

        pdf.save('ベスト記録.pdf');

        // 元の展開状態に戻す
        setExpandedStyles({});
      } catch (error) {
        console.error('PDFの生成に失敗しました:', error);
      }
    }, 500);
  };

  if (error) {
    return (
      <PageLayout title="エラー" subtitle="記録の取得に失敗しました">
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">{error}</div>
        </div>
      </PageLayout>
    );
  }

  const actions = (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex rounded-md shadow-sm">
        <button
          onClick={() => setIsShortCourse(true)}
          className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
            isShortCourse
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          } transition-colors duration-200`}
        >
          短水路
        </button>
        <button
          onClick={() => setIsShortCourse(false)}
          className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
            !isShortCourse
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          } transition-colors duration-200`}
        >
          長水路
        </button>
      </div>
      <button
        onClick={handleDownloadPDF}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF出力
      </button>
    </div>
  );

  return (
    <PageLayout 
      title="ベスト記録" 
      subtitle={`${isShortCourse ? '短水路' : '長水路'}のベスト記録`}
      actions={actions}
    >
      <div ref={contentRef}>
        {Object.entries(groupedRecords).map(([styleId, records]) => (
          <div key={styleId} data-style-id={styleId} className="border-b border-gray-200 last:border-b-0">
            <div 
              className="px-4 sm:px-6 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => toggleStyle(parseInt(styleId))}
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">{STYLE_NAMES[parseInt(styleId)]}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStyle(parseInt(styleId));
                  }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-1"
                >
                  <svg
                    className={`h-5 w-5 transform transition-transform ${
                      expandedStyles[parseInt(styleId)] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {expandedStyles[parseInt(styleId)] && (
              <div className="overflow-x-auto">
                {/* PC版テーブル */}
                <div className="hidden lg:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          距離
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          記録
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          日付
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map(({ distance_id, record }) => (
                        <tr key={`${styleId}-${distance_id}`} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {DISTANCE_NAMES[distance_id]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {record ? formatTime(calculateTotalTime(record.laps)) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record ? new Date(record.record.date).toLocaleDateString('ja-JP') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* モバイル版カード */}
                <div className="lg:hidden p-4 space-y-3">
                  {records.map(({ distance_id, record }) => (
                    <div key={`${styleId}-${distance_id}`} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {DISTANCE_NAMES[distance_id]}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {record ? new Date(record.record.date).toLocaleDateString('ja-JP') : '記録なし'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {record ? formatTime(calculateTotalTime(record.laps)) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}; 