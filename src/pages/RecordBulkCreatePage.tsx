import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api/client';
import { useAuth } from '../hooks/useAuth';
import { PageLayout } from '../components/PageLayout';

interface BulkCreateResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface RecordData {
  date: string;
  style_id: number;
  distance_id: number;
  is_short_course: boolean;
  memo: string;
  lap_times: string[];
}

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

// distance_idに基づくlap数を定義
const DISTANCE_LAPS: { [key: number]: number } = {
  1: 1,   // 50m = 1ラップ
  2: 2,   // 100m = 2ラップ
  3: 4,   // 200m = 4ラップ
  4: 8,   // 400m = 8ラップ
  5: 16,  // 800m = 16ラップ
  6: 30,  // 1500m = 30ラップ
};

// 時間オプションを生成
const generateTimeOptions = (max: number) => {
  return Array.from({ length: max }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
  }));
};

const MINUTES = generateTimeOptions(60);
const SECONDS = generateTimeOptions(60);
const MILLISECONDS = generateTimeOptions(100);

export const RecordBulkCreatePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BulkCreateResult[]>([]);
  const [records, setRecords] = useState<RecordData[]>([
    {
      date: new Date().toISOString().split('T')[0],
      style_id: 1,
      distance_id: 2,
      is_short_course: true,
      memo: '',
      lap_times: ['00:00.00', '00:00.00'],
    }
  ]);

  const addRecord = () => {
    setRecords([...records, {
      date: new Date().toISOString().split('T')[0],
      style_id: 1,
      distance_id: 2,
      is_short_course: true,
      memo: '',
      lap_times: ['00:00.00', '00:00.00'],
    }]);
    
    // 記録を追加したら少し待ってからスクロール
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const removeRecord = (index: number) => {
    if (records.length > 1) {
      setRecords(records.filter((_, i) => i !== index));
    }
  };

  const updateRecord = (index: number, field: keyof RecordData, value: any) => {
    const newRecords = [...records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    
    // distance_idが変更された場合、lap_timesを更新
    if (field === 'distance_id') {
      const newDistanceId = value as number;
      const expectedLaps = DISTANCE_LAPS[newDistanceId] || 1;
      const currentLaps = newRecords[index].lap_times.length;
      
      if (currentLaps < expectedLaps) {
        // ラップ数を増やす
        const additionalLaps = expectedLaps - currentLaps;
        for (let i = 0; i < additionalLaps; i++) {
          newRecords[index].lap_times.push('00:00.00');
        }
      } else if (currentLaps > expectedLaps) {
        // ラップ数を減らす
        newRecords[index].lap_times = newRecords[index].lap_times.slice(0, expectedLaps);
      }
    }
    
    setRecords(newRecords);
  };

  const updateLapTime = (recordIndex: number, lapIndex: number, field: 'minutes' | 'seconds' | 'milliseconds', value: string) => {
    const newRecords = [...records];
    const currentLapTime = newRecords[recordIndex].lap_times[lapIndex];
    const [minutes, seconds] = currentLapTime.split(':');
    const [sec, ms = '00'] = seconds.split('.');
    
    let newMinutes = minutes;
    let newSeconds = sec;
    let newMilliseconds = ms;
    
    if (field === 'minutes') {
      newMinutes = value;
    } else if (field === 'seconds') {
      newSeconds = value;
    } else if (field === 'milliseconds') {
      newMilliseconds = value;
    }
    
    const newLapTime = `${newMinutes}:${newSeconds}.${newMilliseconds}`;
    newRecords[recordIndex].lap_times[lapIndex] = newLapTime;
    setRecords(newRecords);
  };

  const handleBulkCreate = async () => {
    if (!currentUser) return;

    setIsProcessing(true);
    setResults([]);

    const newResults: BulkCreateResult[] = [];
    let allSuccess = true;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        const response = await api.createRecordByUserUUID(currentUser.uuid, {
          style_id: record.style_id,
          distance_id: record.distance_id,
          date: new Date(record.date).toISOString(),
          is_short_course: record.is_short_course,
          memo: record.memo,
          lap_times: record.lap_times,
        });

        newResults.push({
          success: true,
          message: `${i + 1}件目: 記録を作成しました`,
          data: response.data,
        });
      } catch (err: any) {
        allSuccess = false;
        newResults.push({
          success: false,
          message: `${i + 1}件目: 記録の作成に失敗しました`,
          error: err.response?.data?.message || err.message,
        });
      }

      // 進捗を更新
      setResults([...newResults]);
    }

    setIsProcessing(false);
    
    // すべて成功した場合は一覧に戻る
    if (allSuccess) {
      setTimeout(() => {
        navigate('/records');
      }, 1000);
    }
  };

  return (
    <PageLayout 
      title="記録登録" 
      subtitle="複数の記録を一度に作成可能"
      onBack={() => navigate('/records')}
    >
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* 記録作成フォーム */}
        <div className="bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900"></h3>
            <div className="flex gap-2">
              <button
                onClick={addRecord}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                記録追加
              </button>
              <button
                onClick={handleBulkCreate}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    処理中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    一括登録
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {records.map((record, recordIndex) => (
              <div key={recordIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">記録 {recordIndex + 1}</h4>
                  {records.length > 1 && (
                    <button
                      onClick={() => removeRecord(recordIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* 日付 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                    <input
                      type="date"
                      value={record.date}
                      onChange={(e) => updateRecord(recordIndex, 'date', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* 種目 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">種目</label>
                    <select
                      value={record.style_id}
                      onChange={(e) => updateRecord(recordIndex, 'style_id', parseInt(e.target.value))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      {Object.entries(STYLE_NAMES).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 距離 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">距離</label>
                    <select
                      value={record.distance_id}
                      onChange={(e) => updateRecord(recordIndex, 'distance_id', parseInt(e.target.value))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      {Object.entries(DISTANCE_NAMES).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* コース */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">コース</label>
                    <select
                      value={record.is_short_course.toString()}
                      onChange={(e) => updateRecord(recordIndex, 'is_short_course', e.target.value === 'true')}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="true">短水路</option>
                      <option value="false">長水路</option>
                    </select>
                  </div>
                </div>

                {/* メモ */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <input
                    type="text"
                    value={record.memo}
                    onChange={(e) => updateRecord(recordIndex, 'memo', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="記録に関するメモ"
                  />
                </div>

                {/* ラップタイム */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ラップタイム</label>
                  <div className="space-y-2">
                    {record.lap_times.map((lapTime, lapIndex) => {
                      const [timePart, msPart = '00'] = lapTime.split('.');
                      const [minutes = '00', seconds = '00'] = timePart.split(':');
                      
                      return (
                        <div key={lapIndex} className="flex items-center space-x-2">
                          <label className="block text-xs text-gray-600 w-12">
                            {(lapIndex + 1) * 50}m
                          </label>
                          <div className="flex items-center space-x-1">
                            <select
                              value={minutes}
                              onChange={(e) => updateLapTime(recordIndex, lapIndex, 'minutes', e.target.value)}
                              className="block w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                              {MINUTES.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <span className="text-sm">:</span>
                            <select
                              value={seconds}
                              onChange={(e) => updateLapTime(recordIndex, lapIndex, 'seconds', e.target.value)}
                              className="block w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                              {SECONDS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <span className="text-sm">.</span>
                            <select
                              value={msPart}
                              onChange={(e) => updateLapTime(recordIndex, lapIndex, 'milliseconds', e.target.value)}
                              className="block w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                              {MILLISECONDS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 結果表示 */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">登録結果</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    result.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center">
                    {result.success ? (
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className="text-sm font-medium">{result.message}</span>
                  </div>
                  {result.error && (
                    <div className="text-xs mt-1 opacity-75">{result.error}</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                成功: {results.filter(r => r.success).length}件 / 
                失敗: {results.filter(r => !r.success).length}件 / 
                合計: {results.length}件
              </div>
            </div>
          </div>
        )}

        {/* ページ下部の一括登録ボタン */}
        <div className="flex justify-end gap-2">
          <button
            onClick={addRecord}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            記録追加
          </button>
          <button
            onClick={handleBulkCreate}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                一括登録
              </>
            )}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}; 