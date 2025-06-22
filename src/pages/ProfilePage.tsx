import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageLayout } from '../components/PageLayout';
import { api } from '../services/api';

interface ProfileFormData {
  name: string;
  email: string;
}

export const ProfilePage: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  if (!currentUser) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put(`/users/uuid/${currentUser.uuid}`, {
        name: formData.name,
        email: formData.email,
      });

      // ユーザー情報を更新
      updateUser({
        ...currentUser,
        name: formData.name,
        email: formData.email,
      });

      setSuccess('プロフィールを更新しました');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const actions = isEditing ? (
    <div className="flex gap-2">
      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
      >
        キャンセル
      </button>
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            保存中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            保存
          </>
        )}
      </button>
    </div>
  ) : (
    <button
      onClick={handleEdit}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      プロフィール編集
    </button>
  );

  return (
    <PageLayout 
      title="プロフィール" 
      subtitle="アカウント情報"
      actions={actions}
    >
      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* メッセージ表示 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* プロフィール情報 */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">基本情報</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-2">名前</dt>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="名前を入力"
                    />
                  ) : (
                    <dd className="text-lg font-semibold text-gray-900">{currentUser.name}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-2">メールアドレス</dt>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="メールアドレスを入力"
                    />
                  ) : (
                    <dd className="text-lg font-semibold text-gray-900">{currentUser.email}</dd>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* アカウント情報 */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">アカウント情報</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">アカウント作成日</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(currentUser.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">最終更新日</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(currentUser.updated_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}; 