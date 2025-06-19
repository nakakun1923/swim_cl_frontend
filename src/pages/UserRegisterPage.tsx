import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18080/api';

export const UserRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('全ての項目を入力してください');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('メールアドレスの形式が正しくありません');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'ユーザー登録に失敗しました');
        setIsLoading(false);
        return;
      }
      // 成功時は認証メール送信済み画面へ
      navigate('/register/sent', { state: { email } });
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout title="ユーザー登録" subtitle="新規アカウントを作成">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow space-y-6">
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            required
            minLength={6}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ログインへ戻る
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? '登録中...' : '登録'}
          </button>
        </div>
      </form>
    </PageLayout>
  );
}; 