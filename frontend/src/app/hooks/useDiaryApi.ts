/**
 * 일기 API 함수
 * 백엔드 diary-service와 통신
 */

import { fetchJSONFromGateway } from '../../lib/api/client';
import { SERVICE_ENDPOINTS } from '../../lib/constants/endpoints';
import { Diary } from '../../components/types';

// 백엔드 응답 형식
interface Messenger {
  Code: number;
  message: string;
  data: any;
}

// 백엔드 DiaryModel 형식
interface DiaryModel {
  id?: number;
  diaryDate?: string; // "YYYY-MM-DD"
  title: string;
  content: string;
  userId?: number;
}

/**
 * 백엔드 DiaryModel을 프론트엔드 Diary로 변환
 */
function modelToDiary(model: DiaryModel): Diary {
  console.log('[modelToDiary] 변환 시작:', model);
  const diary = {
    id: model.id?.toString() || Date.now().toString(),
    date: model.diaryDate || new Date().toISOString().split('T')[0],
    title: model.title || '',
    content: model.content || '',
    emotion: '😊', // 기본값 (백엔드에 없음)
    emotionScore: 5, // 기본값 (백엔드에 없음)
  };
  console.log('[modelToDiary] 변환 완료:', diary);
  return diary;
}

/**
 * 프론트엔드 Diary를 백엔드 DiaryModel로 변환
 */
function diaryToModel(diary: Diary, userId?: number): DiaryModel {
  return {
    id: diary.id ? parseInt(diary.id) : undefined,
    diaryDate: diary.date,
    title: diary.title,
    content: diary.content,
    userId: userId,
  };
}

/**
 * 사용자별 일기 조회
 */
export async function fetchDiariesByUserId(userId: number): Promise<Diary[]> {
  // Gateway 라우팅: /diary/** → diary-service
  // 백엔드 컨트롤러: @RequestMapping("/diaries")
  // 따라서: /diary/diaries/user/{userId}
  const endpoint = `/diary/diaries/user/${userId}`;
  console.log('[fetchDiariesByUserId] API 호출 시작:', endpoint);
  
  try {
    const response = await fetchJSONFromGateway<Messenger>(
      endpoint,
      {},
      {
        method: 'GET',
      }
    );

    console.log('[fetchDiariesByUserId] 응답 상태:', response.status);
    console.log('[fetchDiariesByUserId] 응답 데이터:', JSON.stringify(response.data, null, 2));
    console.log('[fetchDiariesByUserId] 응답 에러:', response.error);

    // 네트워크 에러나 파싱 에러가 있는 경우
    if (response.error) {
      console.error('[fetchDiariesByUserId] 응답 에러:', response.error);
      // 에러가 있어도 빈 배열 반환 (에러를 throw하지 않음)
      return [];
    }

    // 응답 데이터가 없는 경우
    if (!response.data) {
      console.warn('[fetchDiariesByUserId] 응답 데이터가 없음');
      return [];
    }

    const messenger = response.data as Messenger;
    console.log('[fetchDiariesByUserId] Messenger 객체:', {
      Code: messenger.Code,
      message: messenger.message,
      dataType: Array.isArray(messenger.data) ? 'array' : typeof messenger.data,
      dataLength: Array.isArray(messenger.data) ? messenger.data.length : 'N/A'
    });
    
    // 응답 코드가 200이 아니면 빈 배열 반환 (에러를 throw하지 않음)
    if (messenger.Code !== 200) {
      console.warn('[fetchDiariesByUserId] 응답 코드가 200이 아님:', messenger.Code, messenger.message);
      return [];
    }

    // data가 배열인 경우
    if (Array.isArray(messenger.data)) {
      console.log('[fetchDiariesByUserId] 배열 데이터:', messenger.data.length, '개');
      if (messenger.data.length === 0) {
        console.log('[fetchDiariesByUserId] 빈 배열 반환');
        return [];
      }
      const diaries = messenger.data.map((item: DiaryModel) => {
        console.log('[fetchDiariesByUserId] 일기 항목 변환:', item);
        return modelToDiary(item);
      });
      console.log('[fetchDiariesByUserId] 변환된 일기:', diaries.length, '개', diaries);
      return diaries;
    }

    // data가 단일 객체인 경우
    if (messenger.data && typeof messenger.data === 'object' && !Array.isArray(messenger.data)) {
      console.log('[fetchDiariesByUserId] 단일 객체 데이터:', messenger.data);
      return [modelToDiary(messenger.data as DiaryModel)];
    }

    console.warn('[fetchDiariesByUserId] 데이터 형식이 예상과 다름:', typeof messenger.data);
    return [];
  } catch (error) {
    console.error('[fetchDiariesByUserId] 예외 발생:', error);
    // 예외가 발생해도 빈 배열 반환 (에러를 throw하지 않음)
    return [];
  }
}

/**
 * 전체 일기 조회
 */
export async function fetchDiaries(): Promise<Diary[]> {
  const endpoint = `/diary/diaries`;
  console.log('[fetchDiaries] 전체 일기 조회 시작:', endpoint);
  
  try {
    const response = await fetchJSONFromGateway<Messenger>(
      endpoint,
      {},
      {
        method: 'GET',
      }
    );

    console.log('[fetchDiaries] 응답 상태:', response.status);
    console.log('[fetchDiaries] 응답 데이터 타입:', typeof response.data);
    console.log('[fetchDiaries] 응답 데이터 키:', response.data ? Object.keys(response.data) : 'null');
    console.log('[fetchDiaries] 응답 데이터 (첫 500자):', JSON.stringify(response.data, null, 2).substring(0, 500));
    console.log('[fetchDiaries] 응답 에러:', response.error);

    // 네트워크 에러나 파싱 에러가 있는 경우
    if (response.error) {
      console.error('[fetchDiaries] 응답 에러:', response.error);
      return [];
    }

    // 응답 데이터가 없는 경우
    if (!response.data) {
      console.warn('[fetchDiaries] 응답 데이터가 없음');
      return [];
    }

    // 응답 구조 확인 (code 또는 Code 모두 처리)
    // 백엔드 Messenger 형식: { Code: 200, message: "...", data: [...] } 또는 { code: 200, message: "...", data: [...] }
    console.log('[fetchDiaries] 원본 응답 데이터:', response.data);
    console.log('[fetchDiaries] 응답 데이터 타입:', typeof response.data);
    console.log('[fetchDiaries] 응답 데이터 키:', response.data ? Object.keys(response.data) : 'null');
    
    // response.data가 이미 Messenger 형식인 경우
    const messenger = response.data as Messenger;
    const responseCode = messenger?.Code || (messenger as any)?.code;
    const responseData = messenger?.data;
    
    console.log('[fetchDiaries] 응답 구조:', {
      code: responseCode,
      hasData: !!responseData,
      dataType: Array.isArray(responseData) ? 'array' : typeof responseData,
      dataLength: Array.isArray(responseData) ? responseData.length : 'N/A',
      responseKeys: response.data ? Object.keys(response.data) : [],
    });
    
    // 응답 코드가 200이 아니면 빈 배열 반환
    if (responseCode !== 200) {
      console.warn('[fetchDiaries] 응답 코드가 200이 아님:', responseCode);
      return [];
    }
    
    // data가 배열인 경우
    if (Array.isArray(responseData)) {
      console.log('[fetchDiaries] 배열 데이터:', responseData.length, '개');
      if (responseData.length === 0) {
        console.log('[fetchDiaries] 빈 배열 반환');
        return [];
      }
      const diaries = responseData.map((item: DiaryModel) => {
        console.log('[fetchDiaries] 일기 항목 변환:', item);
        return modelToDiary(item);
      });
      console.log('[fetchDiaries] 변환된 일기:', diaries.length, '개', diaries.slice(0, 3));
      return diaries;
    }
    
    // data가 없는 경우
    if (!responseData) {
      console.warn('[fetchDiaries] 응답 데이터가 없음');
      return [];
    }

    // Messenger 형식인 경우 (messenger.data가 배열)
    // 백엔드 응답 형식: { Code: 200, message: "...", data: [...] }
    if (messenger && messenger.data) {
      if (Array.isArray(messenger.data)) {
        console.log('[fetchDiaries] Messenger 배열 데이터:', messenger.data.length, '개');
        if (messenger.data.length === 0) {
          console.log('[fetchDiaries] 빈 배열 반환');
          return [];
        }
        const diaries = messenger.data.map((item: DiaryModel) => {
          console.log('[fetchDiaries] 일기 항목 변환:', item);
          return modelToDiary(item);
        });
        console.log('[fetchDiaries] 변환된 일기:', diaries.length, '개', diaries.slice(0, 3));
        return diaries;
      }
      
      // data가 단일 객체인 경우
      if (typeof messenger.data === 'object' && !Array.isArray(messenger.data)) {
        console.log('[fetchDiaries] 단일 객체 데이터:', messenger.data);
        return [modelToDiary(messenger.data as DiaryModel)];
      }
    }

    console.warn('[fetchDiaries] 데이터 형식이 예상과 다름:', {
      responseDataType: typeof responseData,
      messengerDataType: messenger?.data ? typeof messenger.data : 'null',
      responseData: response.data,
      responseKeys: response.data ? Object.keys(response.data) : []
    });
    return [];
  } catch (error) {
    console.error('[fetchDiaries] 예외 발생:', error);
    return [];
  }
}

/**
 * 일기 저장
 */
export async function createDiary(diary: Diary, userId: number): Promise<Diary> {
  const diaryModel = diaryToModel(diary, userId);
  
  const response = await fetchJSONFromGateway<Messenger>(
    `/diary/diaries`,
    {},
    {
      method: 'POST',
      body: JSON.stringify(diaryModel),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.error || !response.data) {
    throw new Error(response.error || '일기를 저장하는데 실패했습니다.');
  }

  const messenger = response.data as Messenger;
  
  if (messenger.Code !== 200) {
    throw new Error(messenger.message || '일기를 저장하는데 실패했습니다.');
  }

  return modelToDiary(messenger.data as DiaryModel);
}

/**
 * 일기 수정
 */
export async function updateDiary(diary: Diary, userId: number): Promise<Diary> {
  const diaryModel = diaryToModel(diary, userId);
  
  const response = await fetchJSONFromGateway<Messenger>(
    `/diary/diaries`,
    {},
    {
      method: 'PUT',
      body: JSON.stringify(diaryModel),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.error || !response.data) {
    throw new Error(response.error || '일기를 수정하는데 실패했습니다.');
  }

  const messenger = response.data as Messenger;
  
  if (messenger.Code !== 200) {
    throw new Error(messenger.message || '일기를 수정하는데 실패했습니다.');
  }

  return modelToDiary(messenger.data as DiaryModel);
}

/**
 * 일기 삭제
 */
export async function deleteDiary(diary: Diary, userId: number): Promise<void> {
  const diaryModel = diaryToModel(diary, userId);
  
  const response = await fetchJSONFromGateway<Messenger>(
    `/diary/diaries`,
    {},
    {
      method: 'DELETE',
      body: JSON.stringify(diaryModel),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.error || !response.data) {
    throw new Error(response.error || '일기를 삭제하는데 실패했습니다.');
  }

  const messenger = response.data as Messenger;
  
  if (messenger.Code !== 200) {
    throw new Error(messenger.message || '일기를 삭제하는데 실패했습니다.');
  }
}

