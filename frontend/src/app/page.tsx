"use client";

import { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";
import { useStore } from "../store";

export default function Home() {
  const isLoggedIn = useStore((state) => state.user?.isLoggedIn);
  const [showLanding, setShowLanding] = useState(!isLoggedIn);

  // isLoggedIn 상태가 변경되면 showLanding도 업데이트
  // 단, 동영상 재생 중이 아닐 때만 메인 화면으로 이동
  useEffect(() => {
    console.log('[page.tsx] isLoggedIn 상태 변경:', isLoggedIn);
    // isLoggedIn이 true가 되어도 handleLogin을 통해 명시적으로 호출될 때만 메인 화면으로 이동
    // 동영상 재생 중에는 자동으로 메인 화면으로 넘어가지 않도록 함
  }, [isLoggedIn]);

  const login = useStore((state) => state.user?.login);
  
  const handleLogin = () => {
    console.log('[page.tsx] handleLogin 호출됨, isLoggedIn:', isLoggedIn);
    // 강제로 메인 화면으로 이동
    setShowLanding(false);
    
    // 로그인 상태가 아직 설정되지 않았다면 설정
    if (!isLoggedIn && login) {
      console.log('[page.tsx] 로그인 상태가 없어서 설정');
      login({
        name: 'Guest',
        email: 'guest@aiion.com',
      });
    }
  };

  if (showLanding) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return <HomePage />;
}
