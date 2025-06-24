import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api/client';
import { useAuth } from '../hooks/useAuth';
import { PageLayout } from '../components/PageLayout';
import { RecordForm } from '../components/RecordForm';
import type { RecordFormData } from '../components/RecordForm';

export const RecordCreatePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // デフォルト値
  const initialData: RecordFormData = {
    date: new Date().toISOString().split('T')[0],
    style_id: 1,
    distance_id: 2,
    is_short_course: true,
    memo: '',
    lap_times: ['00:00.00', '00:00.00'],
  };

  const handleSubmit = async (data: RecordFormData) => {
    if (!currentUser) return;
    setIsProcessing(true);
    setError(null);
    try {
      const response = await api.createRecordByUserUUID(currentUser.uuid, {
        style_id: data.style_id,
        distance_id: data.distance_id,
        date: new Date(data.date).toISOString(),
        is_short_course: data.is_short_course,
        memo: data.memo,
        lap_times: data.lap_times,
      });
      if (response.error) {
        setError(response.error);
      } else {
        navigate('/records');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '記録の登録に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageLayout title="記録登録" onBack={() => navigate('/records')}>
      <div className="p-4 sm:p-6">
        <RecordForm
          mode="create"
          initialData={initialData}
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          error={error}
        />
      </div>
    </PageLayout>
  );
}; 