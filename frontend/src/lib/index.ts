/**
 * lib 모듈 통합 export
 * 
 * 사용 예시:
 * import { fetchWithRetry, parseInput, getLocalDateStr } from '@/lib';
 */

// API 클라이언트
export { 
  fetchWithRetry, 
  fetchFromGateway, 
  fetchJSONFromGateway,
  parseJSONResponse,
  type FetchOptions,
  type JSONResponse 
} from './api/client';

// 유틸리티
export { getLocalDateStr, getDayOfWeek, parseDateStr, daysBetween } from './utils/dateUtils';
export { extractCategories } from './utils/parser';

// 상수
export { AGENT_ENDPOINTS, SERVICE_ENDPOINTS, GATEWAY_CONFIG } from './constants/endpoints';

