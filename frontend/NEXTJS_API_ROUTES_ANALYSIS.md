# Next.js API Routes 도입 분석

## 📋 현재 아키텍처

```
[Frontend (Next.js)]
  ↓ 직접 HTTP 요청
[Spring Cloud Gateway :8080]
  ↓ 라우팅
[Microservices]
```

### 현재 통신 방식
- **클라이언트 사이드**: 브라우저에서 직접 Gateway로 요청
- **Gateway 역할**: 
  - API 라우팅
  - CORS 처리 (이미 구성됨)
  - Rate Limiting (준비됨)
  - Load Balancing
  - Service Discovery (Eureka)

---

## 🤔 Next.js API Routes란?

Next.js API Routes는 Next.js 서버에서 실행되는 API 엔드포인트입니다.

```
/app/api/route.ts  (App Router)
또는
/pages/api/route.ts (Pages Router)
```

### Next.js API Routes의 특징
- **서버 사이드 실행**: Node.js 서버에서 실행
- **자동 라우팅**: `/api/*` 경로로 접근 가능
- **서버 리소스 접근**: 파일 시스템, 환경 변수, DB 직접 접근 가능

---

## ✅ Next.js API Routes를 사용해야 하는 경우

### 1. **보안이 중요한 경우**
```typescript
// ❌ 현재 방식 (클라이언트에서 API 키 노출)
const response = await fetch('https://external-api.com', {
  headers: {
    'Authorization': 'Bearer SECRET_KEY' // 브라우저에 노출!
  }
});

// ✅ Next.js API Routes 사용 (서버에서만 키 관리)
// /app/api/external/route.ts
export async function GET() {
  const response = await fetch('https://external-api.com', {
    headers: {
      'Authorization': `Bearer ${process.env.SECRET_API_KEY}` // 서버에서만 접근
    }
  });
  return response.json();
}
```

### 2. **CORS 문제가 있는 경우**
```typescript
// ❌ 외부 API가 CORS를 허용하지 않는 경우
// 브라우저에서 직접 호출 불가

// ✅ Next.js API Routes로 프록시
// /app/api/proxy/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  const response = await fetch(url!); // 서버는 CORS 제한 없음
  return response.json();
}
```

### 3. **요청 변환/가공이 필요한 경우**
```typescript
// /app/api/aggregate/route.ts
export async function GET() {
  // 여러 마이크로서비스에서 데이터 수집
  const [users, posts, comments] = await Promise.all([
    fetch('http://gateway:8080/user/list'),
    fetch('http://gateway:8080/post/list'),
    fetch('http://gateway:8080/comment/list'),
  ]);
  
  // 데이터 가공
  const aggregated = {
    users: await users.json(),
    posts: await posts.json(),
    comments: await comments.json(),
  };
  
  return Response.json(aggregated);
}
```

### 4. **서버 사이드 캐싱이 필요한 경우**
```typescript
// /app/api/cached/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Next.js 서버에서 캐싱
  const response = await fetch('http://gateway:8080/data', {
    next: { revalidate: 60 } // 60초 캐시
  });
  
  return NextResponse.json(await response.json());
}
```

### 5. **파일 업로드/다운로드 처리**
```typescript
// /app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  
  // 서버에서 파일 처리
  // ...
}
```

---

## ❌ Next.js API Routes를 사용하지 않는 것이 좋은 경우

### 1. **현재 아키텍처 (우리 케이스)**

#### 문제점
```
[Frontend]
  ↓
[Next.js API Routes] ← 불필요한 중간 레이어
  ↓
[Gateway] ← 이미 Edge Layer 역할
  ↓
[Microservices]
```

#### 이유
- **Gateway가 이미 Edge Layer 역할**: 
  - API 라우팅 ✅
  - CORS 처리 ✅ (이미 구성됨)
  - Rate Limiting ✅ (준비됨)
  - Load Balancing ✅
  - Service Discovery ✅

- **마이크로서비스 아키텍처 원칙 위반**:
  - Gateway가 이미 모든 요청의 단일 진입점
  - Next.js API Routes 추가 시 중복 레이어 생성
  - 관심사 분리 원칙 위반

- **성능 오버헤드**:
  - 추가 네트워크 홉 (Frontend → Next.js API → Gateway → Service)
  - 불필요한 레이턴시 증가
  - Next.js 서버 리소스 추가 사용

- **복잡성 증가**:
  - 배포 복잡도 증가 (Next.js 서버도 관리 필요)
  - 디버깅 어려움 (추가 레이어)
  - 모니터링 복잡도 증가

### 2. **현재 구조가 잘 작동하는 경우**

우리 프로젝트는:
- ✅ Gateway가 CORS 처리 중
- ✅ API Client가 재시도 로직 포함
- ✅ React Query로 캐싱 처리
- ✅ Gateway가 모든 마이크로서비스 라우팅

**→ 추가 레이어가 불필요함**

---

## 📊 비교 분석

### 현재 구조 (권장)
```
[Browser]
  ↓ fetch('http://gateway:8080/api/...')
[Gateway :8080]
  ↓ 라우팅
[Microservice]
```

**장점**:
- ✅ 단순한 구조
- ✅ Gateway가 모든 Edge 기능 제공
- ✅ 마이크로서비스 아키텍처 원칙 준수
- ✅ 낮은 레이턴시
- ✅ 명확한 책임 분리

**단점**:
- ❌ API 키를 클라이언트에 노출해야 하는 경우 문제
- ❌ 외부 API 직접 호출 시 CORS 문제 가능

### Next.js API Routes 추가 시
```
[Browser]
  ↓ fetch('/api/proxy')
[Next.js API Routes]
  ↓ fetch('http://gateway:8080/api/...')
[Gateway :8080]
  ↓ 라우팅
[Microservice]
```

**장점**:
- ✅ API 키 보안 (서버에서만 관리)
- ✅ CORS 문제 해결
- ✅ 요청 변환/가공 가능
- ✅ 서버 사이드 캐싱

**단점**:
- ❌ 불필요한 중간 레이어
- ❌ 성능 오버헤드
- ❌ 복잡성 증가
- ❌ Gateway 역할과 중복

---

## 🎯 권장 사항

### ✅ **현재 구조 유지 권장**

이유:
1. **Gateway가 이미 완벽한 Edge Layer**
   - CORS 처리 완료
   - Rate Limiting 준비됨
   - 모든 기능이 Gateway에 있음

2. **마이크로서비스 아키텍처 원칙**
   - Gateway가 단일 진입점
   - 관심사 분리 명확
   - 불필요한 레이어 추가 지양

3. **성능 및 복잡성**
   - 현재 구조가 더 단순하고 빠름
   - 추가 레이어는 오버헤드만 증가

### ⚠️ **예외적으로 Next.js API Routes를 고려할 경우**

다음 상황에서만 고려:

1. **외부 API 통합이 필요한 경우**
   ```typescript
   // 외부 API가 CORS를 허용하지 않거나
   // API 키를 클라이언트에 노출할 수 없는 경우
   /app/api/external/route.ts
   ```

2. **복잡한 데이터 집계가 필요한 경우**
   ```typescript
   // 여러 마이크로서비스에서 데이터를 수집하고
   // 복잡한 변환이 필요한 경우
   /app/api/aggregate/route.ts
   ```

3. **파일 처리 등 서버 사이드 작업**
   ```typescript
   // 파일 업로드/다운로드, 이미지 처리 등
   /app/api/files/route.ts
   ```

---

## 📝 결론

### **현재 아키텍처에서는 Next.js API Routes 도입이 불필요합니다**

**이유**:
1. ✅ Gateway가 이미 모든 Edge Layer 기능 제공
2. ✅ CORS 문제 없음 (Gateway에서 처리)
3. ✅ 단순하고 효율적인 구조
4. ✅ 마이크로서비스 아키텍처 원칙 준수

**대안**:
- API 키가 필요한 경우: Gateway에서 처리하거나 환경 변수 사용
- 복잡한 데이터 집계: Gateway에서 Aggregation 또는 별도 Aggregation Service
- 파일 처리: 별도 File Service 또는 Gateway에서 처리

**현재 구조를 유지하는 것이 가장 적절한 선택입니다.** ✅

---

## 🔄 만약 Next.js API Routes를 도입한다면?

### 아키텍처 변경
```
[Frontend]
  ↓ 클라이언트 요청
[Next.js API Routes] ← 새로운 레이어
  ↓ 서버 사이드 요청
[Gateway]
  ↓
[Microservices]
```

### 구현 예시
```typescript
// /app/api/soccer/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  
  // Gateway로 요청 (서버 사이드)
  const response = await fetch(
    `http://gateway:8080/soccer-service/soccer/findByWord?keyword=${keyword}`,
    {
      headers: {
        // 서버에서만 접근 가능한 헤더 추가 가능
        'X-Internal-Request': 'true',
      }
    }
  );
  
  const data = await response.json();
  return Response.json(data);
}
```

### 사용법
```typescript
// 클라이언트에서
const response = await fetch('/api/soccer?keyword=손흥민');
const data = await response.json();
```

### 단점
- ❌ 추가 네트워크 홉
- ❌ Gateway 역할과 중복
- ❌ 복잡성 증가
- ❌ Next.js 서버 리소스 사용

---

**작성일**: 2024-12-19  
**분석 대상**: AIION 마이크로서비스 아키텍처  
**결론**: 현재 구조 유지 권장 ✅

