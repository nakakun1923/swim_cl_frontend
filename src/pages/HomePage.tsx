import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              SwimCL
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              あなたの水泳記録を管理し、成長を追跡しましょう。<br></br>
              ラップタイムからベスト記録まで、すべてを簡単に記録できます。
            </p>
            
            {currentUser ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/records"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  記録一覧を見る
                </Link>
                <Link
                  to="/records/bulk-create"
                  className="inline-flex items-center px-8 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  新しい記録を作成
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                ログインして始める
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 機能紹介セクション */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              主な機能
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 記録管理 */}
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">記録管理</h3>
              <p className="text-gray-600">
                種目、距離、コース別に記録を管理。<br></br>
                ラップタイムも詳細に記録できます。
              </p>
            </div>

            {/* ベスト記録 */}
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ベスト記録</h3>
              <p className="text-gray-600">
                種目・距離別のベスト記録を自動で抽出。<br></br>
                成長の軌跡を確認できます。
              </p>
            </div>

            {/* PDF出力 */}
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF出力</h3>
              <p className="text-gray-600">
                ベスト記録をPDFで出力。<br></br>
                記録を印刷したり、共有したりできます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 統計セクション（ログイン済みの場合のみ表示） */}
      {currentUser && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                あなたの記録
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">記録一覧</div>
                <p className="text-gray-600 mb-4">すべての記録を確認</p>
                <Link
                  to="/records"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  見る
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">記録作成</div>
                <p className="text-gray-600 mb-4">新しい記録を追加</p>
                <Link
                  to="/records/bulk-create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  作成
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">ベスト記録</div>
                <p className="text-gray-600 mb-4">種目別ベストを確認</p>
                <Link
                  to="/bests"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  見る
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-gray-600 mb-2">プロフィール</div>
                <p className="text-gray-600 mb-4">アカウント情報</p>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                >
                  見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 SwimCL. レース結果を記録、管理、追跡
          </p>
        </div>
      </footer>
    </div>
  );
}; 