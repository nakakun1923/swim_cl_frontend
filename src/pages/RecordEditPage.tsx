import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { RecordDetail } from '../types/record';
import { PageLayout } from '../components/PageLayout';
import { useAuth } from '../hooks/useAuth';
import { OcrInputTabs } from "../components/OcrInputTabs";
import { RecordForm } from '../components/RecordForm';
import type { RecordFormData } from '../components/RecordForm';

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

  useEffect(() => {
    const fetchRecordDetail = async () => {
      try {
        const response = await api.get<RecordDetail>(`/records/${id}`);
        setRecordDetail(response.data);
      } catch (err) {
        setError('記録の取得に失敗しました');
      }
    };
    if (id) fetchRecordDetail();
  }, [id]);

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

  // recordDetailから初期値を生成
  const initialData: RecordFormData = {
    date: new Date(recordDetail.record.date).toISOString().split('T')[0],
    style_id: recordDetail.record.style_id,
    distance_id: recordDetail.record.distance_id,
    is_short_course: recordDetail.record.is_short_course,
    memo: recordDetail.record.memo || '',
    lap_times: recordDetail.laps.map(lap => {
      const [_hours, minutes, seconds] = lap.lap_time.split(':');
      const [sec, ms = '00'] = seconds.split('.');
      return `${minutes}:${sec}.${ms}`;
    }),
  };

  return (
    <PageLayout title="記録編集" onBack={() => navigate(-1)}>
      <div className="p-4 sm:p-6">
        <RecordForm
          mode="edit"
          initialData={initialData}
          onSubmit={async (data) => {
            setIsLoading(true);
            setError(null);
            try {
              await api.put(`/records/${id}`, {
                style_id: data.style_id,
                distance_id: data.distance_id,
                date: new Date(data.date).toISOString(),
                is_short_course: data.is_short_course,
                memo: data.memo,
                lap_times: data.lap_times,
              });
              navigate(`/records/${id}`);
            } catch (err: any) {
              setError(err.response?.data?.message || '記録の更新に失敗しました');
            } finally {
              setIsLoading(false);
            }
          }}
          isProcessing={isLoading}
          error={error}
        />
      </div>
    </PageLayout>
  );
}; 