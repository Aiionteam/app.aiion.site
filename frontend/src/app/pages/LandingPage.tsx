"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '../../store';

interface LandingPageProps {
  onLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [introVideoSrc, setIntroVideoSrc] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const login = useStore((state) => state.user?.login);

  // 이메일을 사용자 정보로 매핑 (users.csv 기반)
  const getUserInfoByEmail = (email: string): { id: number; name: string; email: string } | null => {
    const emailToUserMap: Record<string, { id: number; name: string; email: string }> = {
      'admin@a.com': { id: 1, name: '관리자', email: 'admin@a.com' },
      'admin1@a.com': { id: 2, name: '사용자1', email: 'admin1@a.com' },
      'admin2@a.com': { id: 3, name: '사용자2', email: 'admin2@a.com' },
      'admin3@a.com': { id: 4, name: '사용자3', email: 'admin3@a.com' },
      'admin4@a.com': { id: 5, name: '사용자4', email: 'admin4@a.com' },
      'hong@example.com': { id: 6, name: '홍길동', email: 'hong@example.com' },
      'kim@example.com': { id: 7, name: '김철수', email: 'kim@example.com' },
      'lee@example.com': { id: 8, name: '이영희', email: 'lee@example.com' },
      'park@example.com': { id: 9, name: '박민수', email: 'park@example.com' },
      'jung@example.com': { id: 10, name: '정수진', email: 'jung@example.com' },
    };
    return emailToUserMap[email.toLowerCase()] || null;
  };

  const handleLogin = () => {
    if (!id.trim() || !password.trim()) {
      alert('ID와 비밀번호를 입력해주세요.');
      return;
    }

    // 간단한 로그인 검증 (실제로는 백엔드 API 호출 필요)
    const userInfo = getUserInfoByEmail(id.trim());
    if (!userInfo) {
      alert('등록되지 않은 이메일입니다.');
      return;
    }

    if (password !== '1234') {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 사용자 정보 저장
    if (login) {
      login({
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
      });
    }

    console.log('로그인 성공:', { userId: userInfo.id, email: id });
    // 인트로 동영상 재생
    setIntroVideoSrc('/aiion_intro2.mp4');
    setIsPlayingIntro(true);
  };

  const handleGoogleLogin = () => {
    // 구글 로그인 - user_id 없이 로그인 처리
    // 인트로 동영상 재생 후 메인 화면으로 이동
    console.log('구글 로그인 시작 - 인트로 재생 후 메인 화면으로 이동');
    
    // 먼저 인트로 동영상 재생 시작 (로그인은 동영상 재생 완료 후 처리)
    setIntroVideoSrc('/aiion_intro2.mp4');
    setIsPlayingIntro(true);
    
    // 로그인 처리는 동영상 재생 완료 후 handleVideoEnded에서 처리
  };

  const handleVideoEnded = () => {
    console.log('[LandingPage] 동영상 재생 완료, 메인 화면으로 이동');
    // 동영상 재생 완료 시 로그인 처리 후 메인 화면으로 이동
    setIsPlayingIntro(false);
    setIntroVideoSrc('');
    
    // 동영상 재생 완료 후 로그인 처리
    if (login) {
      console.log('[LandingPage] 동영상 재생 완료 후 로그인 처리');
      login({
        name: 'Guest',
        email: 'guest@aiion.com',
        // id는 optional이므로 전달하지 않음 (user_id 없이 로그인)
      });
    }
    
    // onLogin 콜백 호출하여 메인 화면으로 이동
    if (onLogin) {
      console.log('[LandingPage] onLogin 콜백 호출');
      // 약간의 지연을 주어 로그인 상태가 설정된 후 메인 화면으로 이동
      setTimeout(() => {
        onLogin();
      }, 100);
    } else {
      console.warn('[LandingPage] onLogin 콜백이 없음');
    }
  };

  // 동영상 소스가 변경되면 재생 시도
  useEffect(() => {
    if (isPlayingIntro && introVideoSrc && videoRef.current) {
      const video = videoRef.current;
      
      const handleCanPlay = () => {
        video.play().catch((error) => {
          console.error('동영상 재생 실패:', error);
          // 재생 실패 시 바로 메인 화면으로 이동
          setIsPlayingIntro(false);
          setIntroVideoSrc('');
          if (onLogin) {
            console.log('[LandingPage] 재생 실패로 인한 onLogin 호출');
            onLogin();
          }
        });
      };

      const handleError = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        const error = target.error;
        const errorInfo: Record<string, unknown> = { src: introVideoSrc };
        
        if (error) {
          errorInfo.code = error.code;
          errorInfo.message = error.message;
          
          // 에러 코드별 메시지
          const errorMessages: Record<number, string> = {
            1: 'MEDIA_ERR_ABORTED - 사용자가 중단',
            2: 'MEDIA_ERR_NETWORK - 네트워크 오류',
            3: 'MEDIA_ERR_DECODE - 디코딩 오류',
            4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - 소스 미지원'
          };
          errorInfo.description = errorMessages[error.code] || '알 수 없는 오류';
        } else {
          errorInfo.description = '동영상 파일을 찾을 수 없습니다';
        }
        
        console.error('동영상 로드 오류:', errorInfo);
        // 오류 발생 시 바로 메인 화면으로 이동
        setIsPlayingIntro(false);
        setIntroVideoSrc('');
        if (onLogin) {
          console.log('[LandingPage] 오류로 인한 onLogin 호출');
          onLogin();
        }
      };

      // 이벤트 리스너 추가
      video.addEventListener('canplay', handleCanPlay, { once: true });
      video.addEventListener('error', handleError, { once: true });
      
      // 동영상 로드 시작
      video.load();

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [isPlayingIntro, introVideoSrc, onLogin]);

  return (
    <div className="h-screen overflow-hidden bg-black flex flex-col md:flex-row relative">
      {/* 인트로 동영상 재생 중 오버레이 */}
      {isPlayingIntro && introVideoSrc && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
            <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={introVideoSrc}
            onEnded={handleVideoEnded}
            onError={(e) => {
              console.error('[LandingPage] 동영상 재생 오류:', e);
              // 오류 발생 시 바로 메인 화면으로 이동
              handleVideoEnded();
            }}
            playsInline
            preload="auto"
            autoPlay
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        </div>
      )}

      {/* 왼쪽 영역: 로고 + 문구 + 로그인 */}
      <div className={`flex flex-col md:w-1/2 h-full overflow-hidden relative z-10 transition-opacity ${isPlayingIntro ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Aiion 로고 - 왼쪽 상단 */}
        <div className="absolute top-6 md:top-8 lg:top-10 left-6 md:left-8 lg:left-12 z-20">
          <Image
            src="/aiion_logo_white.png"
            alt="Aiion Logo"
            width={300}
            height={120}
            className="w-auto h-16 md:h-20 lg:h-24"
            priority
          />
        </div>

        <div className="flex flex-col justify-center items-center h-full p-6 md:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* 문구 섹션 */}
            <div className="mb-8 md:mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Aiion makes<br />
                daily revolution
              </h1>
              <div className="flex gap-4">
                <button className="px-6 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-all text-sm md:text-base">
                  더 알아보기
                </button>
                <button className="px-6 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-all text-sm md:text-base">
                  앱 다운로드
                </button>
              </div>
            </div>

            {/* 로그인 카드 */}
            <div className="w-full">
              {/* 로그인 UI */}
              <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700/50">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              로그인
            </h2>
            
            {/* ID 입력 */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                이메일 또는 아이디
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="이메일 또는 아이디를 입력하세요"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-all text-base text-white placeholder-gray-400"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              />
            </div>

            {/* Password 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-all text-base text-white placeholder-gray-400"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin}
              className="w-full px-4 py-3.5 bg-[#8B7355] text-white rounded-lg hover:bg-[#6d5943] transition-all font-semibold text-base mb-6 shadow-md hover:shadow-lg touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              로그인
            </button>

            {/* 구분선 */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/95 text-gray-400">또는</span>
              </div>
            </div>

            {/* 구글 로그인 */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-700 transition-all font-medium text-white mb-4 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-base">Google로 계속하기</span>
            </button>

            {/* 회원가입 */}
            <div className="text-center">
              <span className="text-sm text-gray-400">계정이 없으신가요? </span>
              <button
                onClick={() => {
                  // TODO: 회원가입 페이지로 이동
                  console.log('회원가입');
                }}
                className="text-sm text-[#8B7355] hover:text-[#a68a6d] font-semibold underline touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                회원가입
              </button>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 영역: 회사 인트로 동영상 */}
      <div className={`flex-1 md:w-1/2 h-full flex items-stretch relative overflow-hidden transition-opacity ${isPlayingIntro ? 'opacity-0' : 'opacity-100'}`}>
        {/* 그라데이션 오버레이 - 왼쪽에서 오른쪽으로 자연스러운 전환 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/15 z-10 pointer-events-none"></div>
        
        <div className="w-full h-full relative">
          {/* 동영상 파일: public/aiion_login.mp4 */}
          <video
            className="w-full h-full object-cover"
            controls
            autoPlay
            loop
            muted
            playsInline
            src="/aiion_login.mp4"
            onError={(e) => {
              // 동영상이 없을 경우 placeholder 표시
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
          <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-[#8B7355] to-[#6d5943]" style={{ display: 'none' }}>
            <p className="text-center text-sm">
              동영상 파일을 찾을 수 없습니다.<br />
              <span className="text-xs text-white/80">public/aiion_login.mp4 파일을 확인해주세요.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

