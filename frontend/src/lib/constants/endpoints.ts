/**
 * API 엔드포인트 상수
 * 
 * 12개 서비스 (AI 에이전트 5개 + MS 7개)를 위한 엔드포인트 정의
 */

// TODO: AI 에이전트 엔드포인트 (5개)
export const AGENT_ENDPOINTS = {
  // agent1: '/api/agent1',
  // agent2: '/api/agent2',
  // agent3: '/api/agent3',
  // agent4: '/api/agent4',
  // agent5: '/api/agent5',
} as const;

// TODO: 마이크로서비스 엔드포인트 (7개)
export const SERVICE_ENDPOINTS = {
  SOCCER: '/soccer/findByWord',
  CALENDAR: '/api/calendar',
  DIARY: '/api/diary',
  COMMON: '/api/common',
  // service4: '/api/service4',
  // service5: '/api/service5',
  // service6: '/api/service6',
} as const;

// Gateway 설정
export const GATEWAY_CONFIG = {
  HOST: process.env.GATEWAY_HOST || 'gateway-server',
  PORT: process.env.GATEWAY_PORT || '8080',
  BASE_URL: `http://${process.env.GATEWAY_HOST || 'gateway-server'}:${process.env.GATEWAY_PORT || '8080'}`,
} as const;

