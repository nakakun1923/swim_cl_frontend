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
  const [_hours, minutes, seconds] = lastLap.lap_time.split(':');
  const [sec, ms = '00'] = seconds.split('.');
  const totalSeconds = parseInt(minutes) * 60 + parseInt(sec) + parseFloat(`0.${ms}`);
  
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;
  return `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toFixed(2).padStart(5, '0')}`;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18080/api';

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
        const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
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
    <div className="flex gap-2"></div>
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
            value={filters.isShortCourse}
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
        {/* 並び替えボタン */}
        <div className="flex gap-2 my-2">
          <button
            onClick={() => handleSort('date')}
            className={`px-3 py-1 rounded border text-xs ${sortConfig.key === 'date' ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-bold' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
          >
            日付で並び替え
          </button>
          <button
            onClick={() => handleSort('time')}
            className={`px-3 py-1 rounded border text-xs ${sortConfig.key === 'time' ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-bold' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
          >
            記録で並び替え
          </button>
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
              {/* 一括登録ボタンを削除 */}
            </div>
          </div>
        ) : (
          <>
            {/* PC版テーブル */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1">日付</th>
                    <th className="px-2 py-1">種目</th>
                    <th className="px-2 py-1">記録</th>
                    <th className="px-2 py-1">コース</th>
                    <th className="px-2 py-1">操作</th>
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
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
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
                      <td
                        className="px-2 py-1 whitespace-nowrap text-sm text-gray-500 cursor-pointer underline"
                        onClick={() => { window.scrollTo(0, 0); currentUser && navigate(`/records/${record.record.id}`); }}
                      >
                        {DISTANCE_NAMES[record.record.distance_id]}{STYLE_NAMES[record.record.style_id]}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        {calculateTotalTime(record.laps)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        {record.record.is_short_course ? '短水路' : '長水路'}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { window.scrollTo(0, 0); currentUser && navigate(`/records/${record.record.id}`); }}
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
            {/* スマホ版テーブル */}
            <div className="block lg:hidden overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1">{''}</th>
                    <th className="px-2 py-1">種目</th>
                    <th className="px-2 py-1">記録</th>
                    <th className="px-2 py-1">コース</th>
                    <th className="px-2 py-1">日付</th>
                    <th className="px-2 py-1">詳細</th>
                    <th className="px-2 py-1">削除</th>
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
                      <td className="px-2 py-1 text-center">
                        {isBestRecord(record) ? '⭐️' : ''}
                      </td>
                      <td
                        className="px-2 py-1 whitespace-nowrap text-sm text-gray-900 cursor-pointer underline"
                        onClick={() => { window.scrollTo(0, 0); currentUser && navigate(`/records/${record.record.id}`); }}
                      >
                        {DISTANCE_NAMES[record.record.distance_id]}{STYLE_NAMES[record.record.style_id]}
                      </td>
                      <td
                        className="px-2 py-1 whitespace-nowrap text-sm text-gray-900 cursor-pointer underline"
                        onClick={() => { window.scrollTo(0, 0); currentUser && navigate(`/records/${record.record.id}`); }}
                      >
                        {calculateTotalTime(record.laps)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        {record.record.is_short_course ? '短水路' : '長水路'}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.record.date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => { window.scrollTo(0, 0); currentUser && navigate(`/records/${record.record.id}`); }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          詳細
                        </button>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDelete(record.record.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}; 