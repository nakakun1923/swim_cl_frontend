import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-white flex flex-col">
      {/* ヒーロー */}
      <section className="relative text-center py-16 px-4 sm:py-24">
        <div className="absolute inset-0 pointer-events-none select-none opacity-10 bg-[url('/assets/swim_hero.svg')] bg-center bg-no-repeat bg-contain" />
        <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 leading-tight text-indigo-800 drop-shadow">
          SwimCLで<br className="sm:hidden" />記録管理を<br className="sm:hidden" />もっと便利に。
        </h1>
        <p className="text-lg sm:text-2xl text-gray-700 mb-8 font-medium">
          画像から自動入力・ベスト自動判定で<br />
          あなたの成長をスマートにサポート。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentUser ? (
            <>
              <Link
                to="/records"
                className="inline-flex items-center px-10 py-4 text-lg font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition"
              >
                記録一覧を見る
              </Link>
              <Link
                to="/records/create"
                className="inline-flex items-center px-10 py-4 text-lg font-bold rounded-full text-indigo-600 bg-white border-2 border-indigo-600 hover:bg-indigo-50 shadow-lg transition"
              >
                新しい記録を作成
              </Link>
            </>
          ) : (
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-indigo-500 to-blue-400 text-white px-12 py-4 rounded-full text-2xl font-extrabold shadow-lg hover:scale-105 transition"
            >
              無料で始める
            </Link>
          )}
        </div>
      </section>

      {/* 推し機能 */}
      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition">
          <div className="mb-4 text-6xl animate-bounce">📷</div>
          <h3 className="font-extrabold text-2xl text-indigo-700 mb-2">画像から記録入力</h3>
          <p className="text-base text-gray-600 text-center">スマホで撮るだけ、手入力不要。<br />OCRで自動認識！</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition">
          <div className="mb-4 text-6xl animate-pulse">🏅</div>
          <h3 className="font-extrabold text-2xl text-indigo-700 mb-2">ベスト記録の自動判定</h3>
          <p className="text-base text-gray-600 text-center">自己ベストを自動で抽出・管理。<br />成長が一目で分かる！</p>
        </div>
      </section>

      {/* 使い方ステップ */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-indigo-800">使い方はカンタン3ステップ</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 w-full sm:w-1/3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-2">1</div>
            <div className="font-bold mb-1">アカウント登録</div>
            <div className="text-sm text-gray-500 text-center">まずは無料でアカウント作成</div>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 w-full sm:w-1/3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-2">2</div>
            <div className="font-bold mb-1">記録を入力</div>
            <div className="text-sm text-gray-500 text-center">画像アップロードで自動入力もOK</div>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl shadow p-6 w-full sm:w-1/3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-2">3</div>
            <div className="font-bold mb-1">ベストやPDF出力</div>
            <div className="text-sm text-gray-500 text-center">自己ベストやPDF出力で管理もラクラク</div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white py-8 text-center mt-auto">
        <p className="text-gray-200">© 2025 SwimCL</p>
      </footer>
    </div>
  );
}; 