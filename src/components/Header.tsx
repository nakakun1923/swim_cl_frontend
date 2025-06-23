import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ページごとのアイコンとタイトル
  let pageIcon = null;
  let pageTitle = '';
  if (location.pathname.startsWith('/records/create')) {
    pageIcon = <span className="text-lg">＋</span>;
    pageTitle = '記録追加';
  } else if (location.pathname.startsWith('/records')) {
    pageIcon = <span className="text-lg">📄</span>;
    pageTitle = '記録一覧';
  } else if (location.pathname.startsWith('/bests')) {
    pageIcon = <span className="text-lg">🏆</span>;
    pageTitle = 'ベスト一覧';
  } else if (location.pathname.startsWith('/profile')) {
    pageIcon = <span className="text-lg">👤</span>;
    pageTitle = 'プロフィール';
  }

  // 現在ページ判定用
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            {/* ハンバーガー（スマホのみ表示）をロゴの左に移動 */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
            <img src="/public/logo.png" alt="ロゴ" width={32} height={32} />
            <Link to="/" className="text-xl font-bold text-indigo-600">
              SwimCL
            </Link>
            {currentUser && (
              <div className="hidden sm:flex sm:ml-10 sm:space-x-8">
                <Link
                  to="/records"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                >
                  記録一覧
                </Link>
                <Link
                  to="/records/create"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                >
                  記録登録
                </Link>
                <Link
                  to="/bests"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                >
                  ベスト一覧
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                >
                  プロフィール
                </Link>
              </div>
            )}
          </div>

          {/* スマホ用：ナビゲーションアイコン＋ユーザー名（右揃え） */}
          <div className="flex-1 flex justify-end items-center gap-2 sm:hidden">
          {currentUser && (
            <div>
              <Link to="/records" className={isActive('/records') && !isActive('/records/create') ? 'mx-1 text-indigo-600' : 'mx-1 text-gray-400'} aria-label="記録一覧">
                <span className="text-lg">📄</span>
              </Link>
              <Link to="/records/create" className={isActive('/records/create') ? 'mx-1 text-indigo-600' : 'mx-1 text-gray-400'} aria-label="記録追加">
                <span className="text-lg">＋</span>
              </Link>
              <Link to="/bests" className={isActive('/bests') ? 'mx-1 text-indigo-600' : 'mx-1 text-gray-400'} aria-label="ベスト一覧">
                <span className="text-lg">🏆</span>
              </Link>
              <Link to="/profile" className={isActive('/profile') ? 'mx-1 text-indigo-600' : 'mx-1 text-gray-400'} aria-label="プロフィール">
                <span className="text-lg">👤</span>
              </Link>
              <a
                href="#"
                className="mx-1 text-lg"
                aria-label="ログアウト"
                onClick={e => {
                  e.preventDefault();
                  if (window.confirm('本当にログアウトしますか？')) {
                    handleLogout();
                  }
                }}
              >
                ❌
              </a>
              </div>
            )}
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {currentUser ? (
              <>
                <span className="text-gray-700 text-sm">
                  ログインユーザ：{currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* スマホ版メニュー */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {currentUser ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-700">
                  ログインユーザ：{currentUser.name}
                </div>
                <Link
                  to="/records"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  記録一覧
                </Link>
                <Link
                  to="/records/create"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  記録登録
                </Link>
                <Link
                  to="/bests"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ベスト一覧
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  プロフィール
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}; 