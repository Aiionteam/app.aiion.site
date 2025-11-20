import React, { useState } from 'react';
import { Button } from '../atoms';
import { CultureView as CultureViewType } from '../types';

interface CultureViewProps {
  cultureView: CultureViewType;
  setCultureView: (view: CultureViewType) => void;
  darkMode?: boolean;
}

export const CultureView: React.FC<CultureViewProps> = ({
  cultureView,
  setCultureView,
  darkMode = false,
}) => {
  const [selectedWishCategory, setSelectedWishCategory] = useState<'travel' | 'movie' | 'performance'>('travel');

  // Home 뷰
  if (cultureView === 'home') {
    return (
      <div className={`flex-1 flex flex-col overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-[#e8e2d5]'}`}>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center py-4">
              <h1 className="text-3xl font-bold text-gray-900">문화 생활</h1>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center border-b-2 border-[#d4c4a8] pb-3">
                📊 종합 문화 분석
              </h2>
              <div className="text-gray-900 leading-relaxed text-sm">
                <p className="text-center text-gray-500 py-4">
                  아직 기록된 문화 활동이 없습니다. 첫 문화 활동을 기록해보세요!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button
                onClick={() => setCultureView('travel')}
                className="bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-12 hover:shadow-lg hover:scale-105 transition-all"
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-4xl">✈️</span>
                  <p className="text-xl font-bold text-gray-900">여행</p>
                </div>
              </Button>
              <Button
                onClick={() => setCultureView('movie')}
                className="bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-12 hover:shadow-lg hover:scale-105 transition-all"
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-4xl">🎬</span>
                  <p className="text-xl font-bold text-gray-900">영화</p>
                </div>
              </Button>
              <Button
                onClick={() => setCultureView('performance')}
                className="bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-12 hover:shadow-lg hover:scale-105 transition-all"
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-4xl">🎭</span>
                  <p className="text-xl font-bold text-gray-900">공연</p>
                </div>
              </Button>
              <Button
                onClick={() => setCultureView('records')}
                className="bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-12 hover:shadow-lg hover:scale-105 transition-all"
              >
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-4xl">📝</span>
                  <p className="text-xl font-bold text-gray-900">기록</p>
                </div>
              </Button>
            </div>
            <Button
              onClick={() => setCultureView('wishlist')}
              className="w-full bg-gradient-to-br from-white to-[#f5f0e8] rounded-2xl border-2 border-[#8B7355] p-8 hover:shadow-lg hover:scale-105 transition-all"
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-3xl">⭐</span>
                <p className="text-lg font-bold text-gray-900">위시리스트</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Travel 뷰
  if (cultureView === 'travel') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setCultureView('home')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">여행</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <p className="text-center text-gray-500 py-8">여행 기록이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Movie 뷰
  if (cultureView === 'movie') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setCultureView('home')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">영화</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <p className="text-center text-gray-500 py-8">영화 기록이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Performance 뷰
  if (cultureView === 'performance') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setCultureView('home')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">공연</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <p className="text-center text-gray-500 py-8">공연 기록이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Records 뷰
  if (cultureView === 'records') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setCultureView('home')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">문화 기록</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <p className="text-center text-gray-500 py-8">기록이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wishlist 뷰
  if (cultureView === 'wishlist') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f1e8]">
        <div className="bg-white border-b border-[#d4c4a8] shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setCultureView('home')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">위시리스트</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#8B7355] p-8 shadow-lg">
              <div className="mb-4">
                <div className="flex gap-2">
                  {(['travel', 'movie', 'performance'] as const).map((category) => (
                    <Button
                      key={category}
                      onClick={() => setSelectedWishCategory(category)}
                      variant={selectedWishCategory === category ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      {category === 'travel' ? '여행' : category === 'movie' ? '영화' : '공연'}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-center text-gray-500 py-8">위시리스트가 비어있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
