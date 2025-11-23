/**
 * 일기 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchDiariesByUserId, fetchDiaries, createDiary, updateDiary, deleteDiary } from './useDiaryApi';
import { Diary } from '../../components/types';
import { useStore } from '../../store';

// Query Keys
export const diaryKeys = {
  all: ['diaries'] as const,
  lists: () => [...diaryKeys.all, 'list'] as const,
  list: (userId: number) => [...diaryKeys.lists(), userId] as const,
  allList: () => [...diaryKeys.lists(), 'all'] as const,
  details: () => [...diaryKeys.all, 'detail'] as const,
  detail: (id: string) => [...diaryKeys.details(), id] as const,
};

/**
 * 사용자별 일기 목록 조회
 */
export function useDiaries(userId?: number) {
  const currentUserId = useStore((state) => state.user?.user?.id);
  // userId가 명시적으로 전달되면 우선 사용, 없으면 currentUserId, 둘 다 없으면 1 (admin@a.com)
  const targetUserId = userId || currentUserId || 1;

  console.log('[useDiaries] userId 확인:', { userId, currentUserId, targetUserId });

  const query = useQuery({
    queryKey: diaryKeys.list(targetUserId),
    queryFn: async () => {
      console.log('[useDiaries] API 호출 시작:', targetUserId);
      try {
        const result = await fetchDiariesByUserId(targetUserId);
        console.log('[useDiaries] API 호출 결과:', result?.length, '개');
        return result || [];
      } catch (error) {
        console.error('[useDiaries] API 호출 중 에러:', error);
        // 에러가 발생해도 빈 배열 반환
        return [];
      }
    },
    enabled: true, // 항상 실행 (targetUserId는 항상 1 이상)
    staleTime: 1000 * 30, // 30초 (더 자주 갱신)
    refetchOnWindowFocus: true, // 포커스 시 다시 가져오기
    retry: 1, // 재시도 1회
    retryDelay: 1000, // 1초 후 재시도
  });

  // React Query v5에서는 onSuccess/onError 대신 useEffect 사용
  useEffect(() => {
    if (query.isSuccess && query.data) {
      console.log('[useDiaries] API 호출 성공:', query.data?.length, '개의 일기', query.data);
    }
  }, [query.isSuccess, query.data]);

  useEffect(() => {
    if (query.isError) {
      console.error('[useDiaries] API 호출 실패:', query.error);
    }
  }, [query.isError, query.error]);
  
  useEffect(() => {
    console.log('[useDiaries] 상태 변경:', {
      isLoading: query.isLoading,
      isSuccess: query.isSuccess,
      isError: query.isError,
      dataLength: query.data?.length,
      error: query.error
    });
  }, [query.isLoading, query.isSuccess, query.isError, query.data, query.error]);

  return query;
}

/**
 * 전체 일기 목록 조회
 */
export function useAllDiaries() {
  console.log('[useAllDiaries] 전체 일기 조회 시작');

  const query = useQuery({
    queryKey: diaryKeys.allList(),
    queryFn: async () => {
      console.log('[useAllDiaries] API 호출 시작');
      try {
        const result = await fetchDiaries();
        console.log('[useAllDiaries] API 호출 결과:', result?.length, '개');
        return result || [];
      } catch (error) {
        console.error('[useAllDiaries] API 호출 중 에러:', error);
        return [];
      }
    },
    enabled: true,
    staleTime: 1000 * 30, // 30초
    refetchOnWindowFocus: true,
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      console.log('[useAllDiaries] API 호출 성공:', query.data?.length, '개의 일기');
    }
  }, [query.isSuccess, query.data]);

  useEffect(() => {
    if (query.isError) {
      console.error('[useAllDiaries] API 호출 실패:', query.error);
    }
  }, [query.isError, query.error]);

  return query;
}

/**
 * 일기 생성 Mutation
 */
export function useCreateDiary() {
  const queryClient = useQueryClient();
  const userId = useStore((state) => state.user?.user?.id);

  return useMutation({
    mutationFn: (diary: Diary) => {
      // user_id가 없으면 기본값 1 사용 (구글 로그인 시 user_id 없을 수 있음)
      const targetUserId = userId || 1;
      console.log('[useCreateDiary] 일기 저장 시작:', { diary, userId: targetUserId });
      return createDiary(diary, targetUserId);
    },
    onSuccess: () => {
      console.log('[useCreateDiary] 일기 저장 성공, 리스트 갱신');
      // 전체 일기 목록 캐시 무효화 (user_id 없이도 동작)
      queryClient.invalidateQueries({ queryKey: diaryKeys.allList() });
    },
    onError: (error) => {
      console.error('[useCreateDiary] 일기 저장 실패:', error);
    },
  });
}

/**
 * 일기 수정 Mutation
 */
export function useUpdateDiary() {
  const queryClient = useQueryClient();
  const userId = useStore((state) => state.user?.user?.id);

  return useMutation({
    mutationFn: (diary: Diary) => {
      // user_id가 없으면 기본값 1 사용 (구글 로그인 시 user_id 없을 수 있음)
      const targetUserId = userId || 1;
      console.log('[useUpdateDiary] 일기 수정 시작:', { diary, userId: targetUserId });
      return updateDiary(diary, targetUserId);
    },
    onSuccess: () => {
      console.log('[useUpdateDiary] 일기 수정 성공, 리스트 갱신');
      // 전체 일기 목록 캐시 무효화 (user_id 없이도 동작)
      queryClient.invalidateQueries({ queryKey: diaryKeys.allList() });
    },
    onError: (error) => {
      console.error('[useUpdateDiary] 일기 수정 실패:', error);
    },
  });
}

/**
 * 일기 삭제 Mutation
 */
export function useDeleteDiary() {
  const queryClient = useQueryClient();
  const userId = useStore((state) => state.user?.user?.id);

  return useMutation({
    mutationFn: (diary: Diary) => {
      // user_id가 없으면 기본값 1 사용 (구글 로그인 시 user_id 없을 수 있음)
      const targetUserId = userId || 1;
      return deleteDiary(diary, targetUserId);
    },
    onSuccess: () => {
      // 전체 일기 목록 캐시 무효화 (user_id 없이도 동작)
      queryClient.invalidateQueries({ queryKey: diaryKeys.allList() });
    },
  });
}

