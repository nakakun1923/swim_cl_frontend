import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { RecordDetail } from '../types/record';
import { PageLayout } from '../components/PageLayout';
import { useAuth } from '../hooks/useAuth';
import { api as apiClient } from '../services/api/client';

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

export const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recordDetail, setRecordDetail] = useState<RecordDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [allRecords, setAllRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecordDetail = async () => {
      try {
        const response = await api.get<RecordDetail>(`/records/${id}`);
        setRecordDetail(response.data);
      } catch (err) {
        setError('記録の取得に失敗しました');
      }
    };

    if (id) {
      fetchRecordDetail();
    }

    // 追加: 全記録取得
    const fetchAllRecords = async () => {
      if (!currentUser) return;
      const res = await apiClient.getRecordsByUserUUID(currentUser.uuid);
      if (res.data) setAllRecords(res.data);
    };
    fetchAllRecords();
  }, [id, currentUser]);

  if (error) {
    return (
      <PageLayout title="エラー" subtitle="記録の取得に失敗しました">
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              記録一覧に戻る
            </button>
          </div>
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

  const { record, laps } = recordDetail;

  const formatTime = (totalSeconds: number) => {
    if (isNaN(totalSeconds)) return '--:--.--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`;
  };

  const formatLapTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(':');
    const [sec, ms = '00'] = seconds.split('.');
    const totalSeconds = parseInt(minutes) * 60 + parseInt(sec) + parseFloat(`0.${ms}`);
    return formatTime(totalSeconds);
  };

  // 各ラップの個別タイムを計算（前のラップとの差分）
  const calculateLapSplit = (laps: typeof recordDetail.laps, currentIndex: number) => {
    if (currentIndex === 0) return null; // 最初のラップは個別タイムなし
    
    const currentTime = laps[currentIndex].lap_time;
    const previousTime = laps[currentIndex - 1].lap_time;
    
    const [hours1, minutes1, seconds1] = currentTime.split(':').map(Number);
    const [hours2, minutes2, seconds2] = previousTime.split(':').map(Number);
    
    const totalSeconds1 = hours1 * 3600 + minutes1 * 60 + seconds1;
    const totalSeconds2 = hours2 * 3600 + minutes2 * 60 + seconds2;
    
    const splitSeconds = totalSeconds1 - totalSeconds2;
    
    const minutes = Math.floor(splitSeconds / 60);
    const seconds = splitSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}`;
  };
  
  // トータルタイム（最終ラップのタイム）
  const totalTime = laps.length > 0 ? formatLapTime(laps[laps.length - 1].lap_time) : '00:00.00';

  // ベスト記録を抽出
  let bestRecord: any = null;
  if (recordDetail && allRecords.length > 0) {
    const sameCondRecords = allRecords.filter(r =>
      r.record.style_id === record.style_id &&
      r.record.distance_id === record.distance_id &&
      r.record.is_short_course === record.is_short_course
    );
    bestRecord = sameCondRecords.sort((a, b) => {
      const getSec = (laps: any[]) => {
        if (!laps.length) return Infinity;
        const t = laps[laps.length - 1].lap_time.split(":");
        const [min, sec] = t[1].split(".");
        return parseInt(t[0]) * 60 + parseInt(min) + parseFloat(`0.${sec ?? '00'}`);
      };
      return getSec(a.laps) - getSec(b.laps);
    })[0];
  }

  // ラップごとの通過タイム（秒）配列を取得
  const getPassingTimes = (laps: any[]) => {
    return laps.map((lap: any) => {
      const [h, m, s] = lap.lap_time.split(":");
      const [sec, ms = '00'] = s.split('.');
      return parseInt(m) * 60 + parseInt(sec) + parseFloat(`0.${ms}`);
    });
  };
  const currentPassingTimes = getPassingTimes(laps);
  const bestPassingTimes = bestRecord ? getPassingTimes(bestRecord.laps) : [];

  return (
    <PageLayout 
      title="記録詳細" 
      subtitle={new Date(record.date).toLocaleDateString('ja-JP')}
    >
      {/* 基本情報 */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">基本情報</h3>
          <button
            onClick={() => navigate(`/records/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">種目</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {DISTANCE_NAMES[record.distance_id]}{STYLE_NAMES[record.style_id]}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">記録</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {totalTime}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">コース</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {record.is_short_course ? '短水路' : '長水路'}
            </dd>
          </div>
        </div>
        
        {record.memo && (
          <div className="mt-6">
            <dt className="text-sm font-medium text-gray-500 mb-2">メモ</dt>
            <dd className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
              {record.memo}
            </dd>
          </div>
        )}
      </div>

      {/* ラップタイム */}
      <div className="p-4 sm:p-6">
        
        {/* PC版テーブル */}
        <div className="hidden lg:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  距離
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイム
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ラップタイム
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ベストとの差
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {laps.map((lap, index) => {
                const lapSplit = calculateLapSplit(laps, index);
                // 通過タイム差分計算
                let diff = null;
                if (bestPassingTimes.length > index) {
                  diff = currentPassingTimes[index] - bestPassingTimes[index];
                }
                return (
                  <tr key={lap.lap_number} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lap.lap_number * 50}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatLapTime(lap.lap_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lapSplit ? (
                        <span className="inline-flex items-center px-2 py-1 text-gray-900 font-semibold font-medium">
                          {lapSplit}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {diff !== null ? (
                        <span className={`font-bold ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}秒
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* モバイル版カード */}
        <div className="lg:hidden space-y-3">
          {laps.map((lap, index) => {
            const lapSplit = calculateLapSplit(laps, index);
            // 通過タイム差分計算
            let diff = null;
            if (bestPassingTimes.length > index) {
              diff = currentPassingTimes[index] - bestPassingTimes[index];
            }
            return (
              <div key={lap.lap_number} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {lap.lap_number * 50}m
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div>
                    <div className="text-xs text-gray-500">通過タイム</div>
                    <div className="text-lg font-semibold text-gray-900">{formatLapTime(lap.lap_time)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ベストとの差</div>
                    <div className="text-sm text-gray-500">
                      {diff !== null ? (
                        <span className={`font-bold ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}秒
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                  {index !== 0 && (
                    <div>
                      <div className="text-xs text-gray-500">ラップタイム</div>
                      <div className="text-medium font-semibold text-gray-900">{lapSplit}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}; 