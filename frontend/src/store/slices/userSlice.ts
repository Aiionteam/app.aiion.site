/**
 * 사용자 정보 관리 슬라이스
 */

import { StateCreator } from 'zustand';
import { AppStore } from '../types';

export interface UserInfo {
  id?: number; // user_id는 선택적 (구글 로그인 시 없을 수 있음)
  name: string;
  email: string;
}

export interface UserState {
  user: UserInfo | null;
  isLoggedIn: boolean;
}

export interface UserActions {
  setUser: (user: UserInfo) => void;
  clearUser: () => void;
  login: (user: UserInfo) => void;
  logout: () => void;
}

export type UserSlice = UserState & UserActions;

export const createUserSlice: StateCreator<
  AppStore,
  [],
  [],
  UserSlice
> = (set) => ({
  // State
  user: null,
  isLoggedIn: false,

  // Actions
  setUser: (user) => set((state) => ({ 
    user: { ...state.user, user, isLoggedIn: true } 
  })),
  
  clearUser: () => set((state) => ({ 
    user: { ...state.user, user: null, isLoggedIn: false } 
  })),
  
  login: (user) => set((state) => ({ 
    user: { ...state.user, user, isLoggedIn: true } 
  })),
  
  logout: () => set((state) => ({ 
    user: { ...state.user, user: null, isLoggedIn: false } 
  })),
});

