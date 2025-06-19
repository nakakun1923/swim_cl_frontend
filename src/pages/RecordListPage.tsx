import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api/client';
import type { RecordDetail } from '../types/record';
import { useAuth } from '../hooks/useAuth';
import { PageLayout } from '../components/PageLayout';

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

const calculateTotalTime = (laps: any[]) => {
  if (laps.length === 0) return '00:00.00';
  
  // 最終ラップのタイムを取得
  const lastLap = laps[laps.length - 1];
  const [hours, minutes, seconds] = lastLap.lap_time.split(':');
  const [sec, ms = '00'] = seconds.split('.');
  const totalSeconds = parseInt(minutes) * 60 + parseInt(sec) + parseFloat(`0.${ms}`);
  
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;
  return `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toFixed(2).padStart(5, '0')}`;
};

export const RecordListPage: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<RecordDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    styleId: '',
    distanceId: '',
    isShortCourse: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: 'date' | 'time' | null;
    direction: 'asc' | 'desc';
  }>({
    key: 'date',
    direction: 'desc',
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        if (!currentUser) return;
        const response = await api.getRecordsByUserUUID(currentUser.uuid);
        if (response.data) {
          // 型を変換
          const convertedRecords: RecordDetail[] = response.data.map((item: any) => ({
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

  // フィルター適用後の記録を取得
  const filteredRecords = records?.filter(record => {
    if (filters.styleId && record.record.style_id !== parseInt(filters.styleId)) return false;
    if (filters.distanceId && record.record.distance_id !== parseInt(filters.distanceId)) return false;
    if (filters.isShortCourse !== '') {
      const isShortCourse = filters.isShortCourse === 'true';
      if (record.record.is_short_course !== isShortCourse) return false;
    }
    return true;
  }) || [];

  // ベスト記録を計算
  const bestRecords = records.reduce((acc: { [key: string]: RecordDetail }, current) => {
    const key = `${current.record.style_id}-${current.record.distance_id}-${current.record.is_short_course}`;
    if (!acc[key] || calculateTotalTime(current.laps) < calculateTotalTime(acc[key].laps)) {
      acc[key] = current;
    }
    return acc;
  }, {});

  // ベスト記録かどうかを判定する関数
  const isBestRecord = (record: RecordDetail) => {
    const key = `${record.record.style_id}-${record.record.distance_id}-${record.record.is_short_course}`;
    return bestRecords[key]?.record.id === record.record.id;
  };

  // ソート機能を追加
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'date') {
      const dateA = new Date(a.record.date).getTime();
      const dateB = new Date(b.record.date).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (sortConfig.key === 'time') {
      const timeA = calculateTotalTime(a.laps);
      const timeB = calculateTotalTime(b.laps);
      return sortConfig.direction === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    }

    return 0;
  });

  const handleSort = (key: 'date' | 'time') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDelete = async (recordId: number) => {
    if (window.confirm('この記録を削除してもよろしいですか？')) {
      try {
        // 削除APIを直接呼び出し
        const response = await fetch(`http://localhost:18080/api/records/${recordId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setRecords(records.filter(record => record.record.id !== recordId));
        } else {
          setError('記録の削除に失敗しました');
        }
      } catch (err) {
        setError('記録の削除に失敗しました');
      }
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

  const actions = (
    <div className="flex gap-2">
      <button
        onClick={() => currentUser && navigate(`/records/bulk-create`)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        一括登録
      </button>
    </div>
  );

  return (
    <PageLayout 
      title="記録一覧" 
      subtitle={`${filteredRecords.length}件の記録`}
      actions={actions}
    >
      {/* フィルター */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">フィルター</h3>
        <div className="grid grid-cols-3 gap-2">
          <select
            id="style"
            value={filters.styleId}
            onChange={(e) => setFilters(prev => ({ ...prev, styleId: e.target.value }))}
            className="block w-full pl-1 pr-4 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md truncate"
          >
            <option value="">種目</option>
            {Object.entries(STYLE_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <select
            id="distance"
            value={filters.distanceId}
            onChange={(e) => setFilters(prev => ({ ...prev, distanceId: e.target.value }))}
            className="block w-full pl-1 pr-4 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md truncate"
          >
            <option value="">距離</option>
            {Object.entries(DISTANCE_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <select
            id="course"
            value={filters.isShortCourse}
            onChange={(e) => setFilters(prev => ({ ...prev, isShortCourse: e.target.value }))}
            className="block w-full pl-1 pr-4 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md truncate"
          >
            <option value="">コース</option>
            <option value="true">短水路</option>
            <option value="false">長水路</option>
          </select>
        </div>
        
        {/* スマホ版ソート機能 */}
        <div className="lg:hidden mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">並び替え</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('date')}
              className={`flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                sortConfig.key === 'date'
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              日付
              {sortConfig.key === 'date' && (
                <svg className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleSort('time')}
              className={`flex-1 inline-flex justify-center items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                sortConfig.key === 'time'
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              記録
              {sortConfig.key === 'time' && (
                <svg className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 記録一覧 */}
      <div className="p-4 sm:p-6">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">記録がありません</h3>
            <p className="mt-1 text-sm text-gray-500">新しい記録を作成してみましょう。</p>
            <div className="mt-6">
              <button
                onClick={() => currentUser && navigate(`/records/bulk-create`)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                一括登録
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* PC版テーブルレイアウト */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        日付
                        {sortConfig.key === 'date' && (
                          <svg className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      種目
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort('time')}
                    >
                      <div className="flex items-center">
                        記録
                        {sortConfig.key === 'time' && (
                          <svg className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      コース
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRecords.map((record) => (
                    <tr 
                      key={record.record.id} 
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        isBestRecord(record) ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {new Date(record.record.date).toLocaleDateString('ja-JP')}
                          {isBestRecord(record) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              ベスト
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {DISTANCE_NAMES[record.record.distance_id]}{STYLE_NAMES[record.record.style_id]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {calculateTotalTime(record.laps)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.record.is_short_course ? '短水路' : '長水路'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => currentUser && navigate(`/records/${record.record.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            詳細
                          </button>
                          <button
                            onClick={() => handleDelete(record.record.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* モバイル版カードレイアウト */}
            <div className="lg:hidden space-y-4">
              {sortedRecords.map((record) => (
                <div 
                  key={record.record.id} 
                  className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                    isBestRecord(record) ? 'border-yellow-400 bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {DISTANCE_NAMES[record.record.distance_id]}{STYLE_NAMES[record.record.style_id]}
                      </h3>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500">
                          {new Date(record.record.date).toLocaleDateString('ja-JP')}
                        </p>
                        {isBestRecord(record) && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            ベスト
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {calculateTotalTime(record.laps)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.record.is_short_course ? '短水路' : '長水路'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => currentUser && navigate(`/records/${record.record.id}`)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      詳細
                    </button>
                    <button
                      onClick={() => handleDelete(record.record.id)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}; 