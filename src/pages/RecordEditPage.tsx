import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { RecordDetail } from '../types/record';
import { PageLayout } from '../components/PageLayout';
import { useAuth } from '../hooks/useAuth';

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

export const RecordEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recordDetail, setRecordDetail] = useState<RecordDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // フォーム状態
  const [formData, setFormData] = useState({
    date: '',
    style_id: 1,
    distance_id: 2,
    is_short_course: true,
    memo: '',
    lap_times: ['00:00.00'] as string[],
  });

  useEffect(() => {
    const fetchRecordDetail = async () => {
      try {
        const response = await api.get<RecordDetail>(`/records/${id}`);
        const record = response.data;
        setRecordDetail(record);
        
        // フォームデータを初期化
        setFormData({
          date: new Date(record.record.date).toISOString().split('T')[0],
          style_id: record.record.style_id,
          distance_id: record.record.distance_id,
          is_short_course: record.record.is_short_course,
          memo: record.record.memo || '',
          lap_times: record.laps.map(lap => {
            const [_hours, minutes, seconds] = lap.lap_time.split(':');
            const [sec, ms = '00'] = seconds.split('.');
            return `${minutes}:${sec}.${ms}`;
          }),
        });
      } catch (err) {
        setError('記録の取得に失敗しました');
      }
    };

    if (id) {
      fetchRecordDetail();
    }
  }, [id]);

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // distance_idが変更された場合、lap_timesを更新
      if (field === 'distance_id') {
        const newDistanceId = value as number;
        const expectedLaps = DISTANCE_LAPS[newDistanceId] || 1;
        const currentLaps = newData.lap_times.length;
        
        if (currentLaps < expectedLaps) {
          // ラップ数を増やす
          const additionalLaps = expectedLaps - currentLaps;
          for (let i = 0; i < additionalLaps; i++) {
            newData.lap_times.push('00:00.00');
          }
        } else if (currentLaps > expectedLaps) {
          // ラップ数を減らす
          newData.lap_times = newData.lap_times.slice(0, expectedLaps);
        }
      }
      
      return newData;
    });
  };

  const updateLapTime = (lapIndex: number, field: 'minutes' | 'seconds' | 'milliseconds', value: string) => {
    setFormData(prev => {
      const newLapTimes = [...prev.lap_times];
      const currentLapTime = newLapTimes[lapIndex];
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
      newLapTimes[lapIndex] = newLapTime;
      
      return { ...prev, lap_times: newLapTimes };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id) return;

    setIsLoading(true);
    try {
      await api.put(`/records/${id}`, {
        style_id: formData.style_id,
        distance_id: formData.distance_id,
        date: new Date(formData.date).toISOString(),
        is_short_course: formData.is_short_course,
        memo: formData.memo,
        lap_times: formData.lap_times,
      });

      navigate(`/records/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '記録の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <PageLayout title="エラー" subtitle="記録の取得に失敗しました">
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            戻る
          </button>
        </div>
      </PageLayout>
    );
  }

  if (!recordDetail) {
    return (
      <PageLayout title="読み込み中..." subtitle="記録を取得しています">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="記録編集" 
      subtitle={new Date(recordDetail.record.date).toLocaleDateString('ja-JP')}
      showBackButton={true}
      onBack={() => navigate(`/records/${id}`)}
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* 基本情報 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 日付 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                required
              />
            </div>

            {/* 種目 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">種目</label>
              <select
                value={formData.style_id}
                onChange={(e) => updateFormData('style_id', parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                required
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
                value={formData.distance_id}
                onChange={(e) => updateFormData('distance_id', parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                required
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
                value={formData.is_short_course.toString()}
                onChange={(e) => updateFormData('is_short_course', e.target.value === 'true')}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                required
              >
                <option value="true">短水路</option>
                <option value="false">長水路</option>
              </select>
            </div>
          </div>

          {/* メモ */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) => updateFormData('memo', e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="記録に関するメモ"
            />
          </div>
        </div>

        {/* ラップタイム */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ラップタイム</h3>
          <div className="space-y-4">
            {formData.lap_times.map((lapTime, lapIndex) => {
              const [timePart, msPart = '00'] = lapTime.split('.');
              const [minutes = '00', seconds = '00'] = timePart.split(':');
              
              return (
                <div key={lapIndex} className="flex items-center space-x-4">
                  <label className="block text-sm font-medium text-gray-700 w-16">
                    {(lapIndex + 1) * 50}m
                  </label>
                  <div className="flex items-center space-x-1">
                    <select
                      value={minutes}
                      onChange={(e) => updateLapTime(lapIndex, 'minutes', e.target.value)}
                      className="block w-16 border border-gray-300 rounded-md shadow-sm py-2 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    >
                      {MINUTES.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <span className="text-sm">:</span>
                    <select
                      value={seconds}
                      onChange={(e) => updateLapTime(lapIndex, 'seconds', e.target.value)}
                      className="block w-16 border border-gray-300 rounded-md shadow-sm py-2 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    >
                      {SECONDS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <span className="text-sm">.</span>
                    <select
                      value={msPart}
                      onChange={(e) => updateLapTime(lapIndex, 'milliseconds', e.target.value)}
                      className="block w-16 border border-gray-300 rounded-md shadow-sm py-2 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
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

        {/* ボタン */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/records/${id}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                更新中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                更新
              </>
            )}
          </button>
        </div>
      </form>
    </PageLayout>
  );
}; 