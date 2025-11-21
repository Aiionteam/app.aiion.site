/**
 * 다크모드 스타일 유틸리티
 * 공통으로 사용되는 다크모드 클래스 조합을 제공합니다
 */

export const darkModeStyles = {
  // 배경
  bgPrimary: (darkMode: boolean) => darkMode ? 'bg-gray-900' : 'bg-[#e8e2d5]',
  bgSecondary: (darkMode: boolean) => darkMode ? 'bg-gray-800' : 'bg-[#f5f1e8]',
  bgTertiary: (darkMode: boolean) => darkMode ? 'bg-gray-700' : 'bg-[#f5f0e8]',
  
  // 카드
  card: (darkMode: boolean) => darkMode 
    ? 'bg-gray-800 border-gray-600' 
    : 'bg-white border-[#8B7355]',
  
  // 버튼 (그라데이션)
  buttonGradient: (darkMode: boolean) => darkMode
    ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
    : 'bg-gradient-to-br from-white to-[#f5f0e8] border-[#8B7355]',
  
  // 텍스트
  textPrimary: (darkMode: boolean) => darkMode ? 'text-white' : 'text-gray-900',
  textSecondary: (darkMode: boolean) => darkMode ? 'text-gray-300' : 'text-gray-700',
  textMuted: (darkMode: boolean) => darkMode ? 'text-gray-400' : 'text-gray-500',
  
  // 보더
  border: (darkMode: boolean) => darkMode ? 'border-gray-700' : 'border-[#d4c4a8]',
  borderPrimary: (darkMode: boolean) => darkMode ? 'border-gray-600' : 'border-[#8B7355]',
  
  // 호버
  hover: (darkMode: boolean) => darkMode ? 'hover:bg-gray-700' : 'hover:bg-[#f5f1e8]',
  hoverText: (darkMode: boolean) => darkMode 
    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-[#f5f1e8]',
};

