import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* ヒーローセクション */}
      <section className="text-center py-10 px-4 sm:py-16">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
          試合結果の管理<br/>もっとカンタンに。
        </h1>
        <p className="text-base sm:text-xl text-gray-600 mb-8">
          画像から自動入力＆ベスト記録も自動判定<br/>
          SwimCLはあなたの成長をサポートします。
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
              to="/records/create"
              className="inline-flex items-center px-8 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              新しい記録を作成
            </Link>
          </div>
        ) : (
          <Link
            to="/register"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-bold shadow hover:bg-indigo-700 transition"
          >
            無料で始める
          </Link>
        )}
      </section>

      {/* 推し機能セクション */}
      <section className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="mb-2 text-4xl">📷</div>
          <h3 className="font-bold mb-1 text-indigo-600">画像から記録入力</h3>
          <p className="text-sm text-gray-600 text-center">スマホで撮るだけ、手入力不要。OCRで自動認識！</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="mb-2 text-4xl">🏅</div>
          <h3 className="font-bold mb-1 text-indigo-600">ベスト記録の自動判定</h3>
          <p className="text-sm text-gray-600 text-center">自己ベストを自動で抽出・管理。<br/>成長が一目で分かる！</p>
        </div>
      </section>

      {/* その他の特徴 */}
      <section className="max-w-4xl mx-auto py-4 px-4">
        <div className="flex flex-row gap-4 overflow-x-auto sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-[180px] w-44 flex-shrink-0">
            <div className="mx-auto mb-2 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">📄</div>
            <h3 className="font-bold mb-1">PDF出力</h3>
            <p className="text-sm text-gray-600">ベスト一覧をPDF化</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-[180px] w-44 flex-shrink-0">
            <div className="mx-auto mb-2 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">📱</div>
            <h3 className="font-bold mb-1">UI・UX</h3>
            <p className="text-sm text-gray-600">PC・スマホ対応</p>
          </div>
        </div>
      </section>

      {/* 使い方3ステップ */}
      <section className="max-w-3xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">使い方はカンタン3ステップ</h2>
        <ol className="space-y-4 max-w-md mx-auto">
          <li className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">1</span>
            アカウント登録
          </li>
          <li className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">2</span>
            記録を入力（画像もOK）
          </li>
          <li className="flex items-center">
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">3</span>
            ベストやPDF出力
          </li>
        </ol>
      </section>

      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 text-center mt-auto">
        <p className="text-gray-400">© 2025 SwimCL</p>
      </footer>
    </div>
  );
}; 