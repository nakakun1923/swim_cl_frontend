import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ページヘッダー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {/* スマホはタイトルとactionsを横並び、サブタイトルは下 */}
            <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-start sm:gap-4">
              <div className="flex items-center gap-2">
                {showBackButton && (
                  <button
                    onClick={onBack}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h1 className="text-lg sm:text-3xl font-bold text-gray-900 truncate">{title}</h1>
              </div>
              {actions && (
                <div className="flex flex-row gap-2 sm:gap-3">
                  {actions}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-base text-gray-600 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* ページコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}; 