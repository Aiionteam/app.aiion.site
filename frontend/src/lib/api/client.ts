/**
 * 공통 API 클라이언트
 * 
 * 12개 서비스 (AI 에이전트 5개 + MS 7개)를 위한 재사용 가능한 API 클라이언트
 * Lambda & JSON 최적화 포함
 */

const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const MAX_JSON_SIZE = 10 * 1024 * 1024; // 10MB

export interface FetchOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

export interface JSONResponse<T = any> {
  data: T;
  error?: string;
  status: number;
}

/**
 * 안전한 JSON 파싱 (에러 핸들링 및 크기 제한)
 * Lambda 최적화: 메모리 효율적인 스트리밍 파싱
 */
export async function parseJSONResponse<T = any>(
  response: Response,
  maxSize: number = MAX_JSON_SIZE
): Promise<JSONResponse<T>> {
  try {
    // Content-Length 확인
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength);
      if (!isNaN(size) && size > maxSize) {
        return {
          data: null as any,
          error: `Response too large: ${size} bytes (max: ${maxSize} bytes)`,
          status: response.status,
        };
      }
    }

    // Clone response to avoid consuming the body
    const clonedResponse = response.clone();
    
    // 텍스트로 읽기 (크기 제한 포함)
    const text = await clonedResponse.text();
    
    // 크기 확인
    if (text.length > maxSize) {
      return {
        data: null as any,
        error: `Response exceeds maximum size: ${text.length} bytes (max: ${maxSize} bytes)`,
        status: response.status,
      };
    }

    // JSON 파싱
    let data: T;
    try {
      data = JSON.parse(text) as T;
    } catch (parseError) {
      return {
        data: null as any,
        error: parseError instanceof Error 
          ? `JSON parse error: ${parseError.message}` 
          : 'Invalid JSON format',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null as any,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: response.status,
    };
  }
}

/**
 * 재시도 로직이 포함된 fetch 함수
 * 
 * @param url - 요청 URL
 * @param options - fetch 옵션
 * @param retries - 재시도 횟수 (기본값: MAX_RETRIES)
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {},
  retries: number = options.retries ?? MAX_RETRIES
): Promise<Response> {
  const timeout = options.timeout ?? REQUEST_TIMEOUT;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 5xx 에러인 경우 재시도
    if (!response.ok && response.status >= 500 && retries > 0) {
      console.log(
        `[API Client] 서버 에러 발생 (${response.status}), ${retries}회 재시도 남음`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }

    // 4xx 에러는 재시도하지 않음
    if (!response.ok && response.status >= 400 && response.status < 500) {
      console.warn(`[API Client] 클라이언트 에러 (${response.status}): 재시도하지 않음`);
    }

    return response;
  } catch (error) {
    // 네트워크 에러인 경우 재시도
    if (retries > 0 && error instanceof Error) {
      if (
        error.name === 'AbortError' ||
        error.message.includes('fetch') ||
        error.message.includes('network')
      ) {
        console.log(`[API Client] 네트워크 에러 발생, ${retries}회 재시도 남음`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
    }
    throw error;
  }
}

/**
 * Gateway를 통한 백엔드 API 호출
 * 
 * @param endpoint - API 엔드포인트 (예: "/api/agent1")
 * @param params - 쿼리 파라미터
 * @param options - 추가 fetch 옵션
 * @returns Promise<Response>
 */
export async function fetchFromGateway(
  endpoint: string,
  params: Record<string, string> = {},
  options: FetchOptions = {}
): Promise<Response> {
  const gatewayHost = process.env.GATEWAY_HOST || 'gateway-server';
  const gatewayPort = process.env.GATEWAY_PORT || '8080';

  const queryString = new URLSearchParams(params).toString();
  const url = `http://${gatewayHost}:${gatewayPort}${endpoint}${queryString ? `?${queryString}` : ''}`;

  console.log(`[API Client] Gateway 요청: ${url}`);

  return fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br', // 압축 지원
    },
    cache: 'no-store', // Next.js에서 fetch 캐싱 비활성화
    ...options,
  });
}

/**
 * Gateway를 통한 JSON 응답 호출 (최적화된 버전)
 * 
 * @param endpoint - API 엔드포인트
 * @param params - 쿼리 파라미터
 * @param options - 추가 fetch 옵션
 * @returns Promise<JSONResponse<T>>
 */
export async function fetchJSONFromGateway<T = any>(
  endpoint: string,
  params: Record<string, string> = {},
  options: FetchOptions = {}
): Promise<JSONResponse<T>> {
  const response = await fetchFromGateway(endpoint, params, options);
  return parseJSONResponse<T>(response);
}

