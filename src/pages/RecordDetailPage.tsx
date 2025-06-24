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
    const [_hours, minutes, seconds] = time.split(':');
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

  // ラップごとの通過タイム（秒）配列を取得
  const getPassingTimes = (laps: any[]) => {
    return laps.map((lap: any) => {
      const [_h, m, s] = lap.lap_time.split(":");
      const [sec, ms = '00'] = s.split('.');
      return parseInt(m) * 60 + parseInt(sec) + parseFloat(`0.${ms}`);
    });
  };

  // 一覧ページと同じベスト判定ロジック
  const calculateTotalTime = (laps: any[]) => {
    if (!laps.length) return Infinity;
    const lastLap = laps[laps.length - 1];
    const [_hours, minutes, seconds] = lastLap.lap_time.split(':');
    const [sec, ms = '00'] = seconds.split('.');
    return parseInt(minutes) * 60 + parseInt(sec) + parseFloat(`0.${ms}`);
  };

  // ベスト記録を計算
  let bestRecord: any = null;
  if (recordDetail && allRecords.length > 0) {
    const sameCondRecords = allRecords.filter(r =>
      r.record.style_id === record.style_id &&
      r.record.distance_id === record.distance_id &&
      r.record.is_short_course === record.is_short_course
    );
    bestRecord = sameCondRecords.reduce((acc, cur) => {
      if (!acc || calculateTotalTime(cur.laps) < calculateTotalTime(acc.laps)) {
        return cur;
      }
      return acc;
    }, null);
  }

  // ベスト記録の通過タイム
  const bestPassingTimes = bestRecord ? getPassingTimes(bestRecord.laps) : [];
  const currentPassingTimes = getPassingTimes(laps);

  const groupSize = 4;
  const lapGroups = [];
  for (let i = 0; i < laps.length; i += groupSize) {
    lapGroups.push(laps.slice(i, i + groupSize));
  }

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
        {/* 種目・記録・コース：全デバイス共通リッチ表示 */}
        <div className="flex flex-row items-center mb-4 overflow-x-auto gap-8 justify-center pr-8">
          <div className="flex flex-col items-center min-w-0">
            <span className="text-xs text-gray-500 mb-1">種目</span>
            <span className="font-bold text-base text-gray-900 whitespace-nowrap">
              {DISTANCE_NAMES[record.distance_id]}{STYLE_NAMES[record.style_id]}
            </span>
            <span className="text-base">({record.is_short_course ? '短水路' : '長水路'})</span>
          </div>
          <div className="flex flex-col items-center min-w-0">
            <span className="text-xs text-gray-500 mb-1">記録</span>
            <span className="font-bold text-base text-gray-900 whitespace-nowrap">
              {totalTime}
            </span>
            {bestRecord && bestRecord.record.id === record.id ? (
              <span className="text-sm font-bold text-orange-500" title="ベストタイム">(Best!)</span>
            ) : (
              bestRecord && (
                <span className="block text-base">
                  (ベスト: {(() => {
                    const bestLap = bestRecord.laps[bestRecord.laps.length - 1];
                    const [_bm, bmin, bsec] = bestLap.lap_time.split(/:|\./);
                    const bestTime = `${bmin.padStart(2, '0')}:${bsec.padStart(2, '0')}.${bestLap.lap_time.split('.')[1]?.padEnd(2, '0') || '00'}`;
                    return bestTime;
                  })()})
                </span>
              )
            )}
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
        {/* PC/SP共通ラップタイム表 */}
        <div className="w-full">
          <table className="w-full text-base border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-bold text-base">距離</th>
                <th className="px-3 py-2 font-bold text-base">タイム</th>
                <th className="px-3 py-2 font-bold text-base">ラップ</th>
                <th className="px-3 py-2 font-bold text-base">ベスト差</th>
              </tr>
            </thead>
            <tbody>
              {laps.map((lap, index) => {
                const lapSplit = calculateLapSplit(laps, index);
                let diff = null;
                // ベスト記録自身の場合はdiffを表示しない
                if (
                  bestRecord && bestRecord.record.id === record.id
                ) {
                  diff = null;
                } else if (
                  bestPassingTimes.length > index &&
                  typeof bestPassingTimes[index] === 'number' &&
                  typeof currentPassingTimes[index] === 'number'
                ) {
                  diff = currentPassingTimes[index] - bestPassingTimes[index];
                }
                return (
                  <tr key={lap.lap_number}>
                    <td className="px-3 py-2 text-center text-base">{lap.lap_number * 50}m</td>
                    <td className="px-3 py-2 text-center font-bold text-base">{formatLapTime(lap.lap_time)}</td>
                    <td className="px-3 py-2 text-center text-base">{lapSplit ? lapSplit : '-'}</td>
                    <td className="px-3 py-2 text-center text-sm">
                      {diff !== null && !isNaN(diff) ? (
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
      </div>
    </PageLayout>
  );
}; 