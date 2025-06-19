import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18080/api';

export const UserVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>("loading");
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('認証トークンがありません');
      return;
    }
    fetch(`${API_BASE_URL}/verify-email?token=${token}`)
      .then(async res => {
        if (res.ok) {
          setStatus('success');
          setMessage('メール認証が完了しました。ログインしてください。');
        } else {
          const data = await res.json();
          setStatus('error');
          setMessage(data.error || '認証に失敗しました');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('通信エラーが発生しました');
      });
  }, [searchParams]);

  return (
    <PageLayout title="メール認証">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow text-center">
        {status === 'loading' && <p className="text-gray-700">認証処理中...</p>}
        {status !== 'loading' && <p className={status === 'success' ? 'text-green-600' : 'text-red-600'}>{message}</p>}
        <button
          onClick={() => navigate('/login')}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          ログイン画面へ
        </button>
      </div>
    </PageLayout>
  );
}; 