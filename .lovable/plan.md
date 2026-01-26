
# Background Removal 실행 실패 문제 분석 및 해결 계획

## 문제 원인 분석

Edge function 로그를 확인한 결과, **Remove.bg API 크레딧 부족**이 문제의 근본 원인입니다:

### 에러 상세 정보
```
Remove.bg API error: 402
{"errors":[{"title":"Insufficient credits","code":"insufficient_credits"}]}
```

- **HTTP 402**: Payment Required (결제 필요)
- **insufficient_credits**: Remove.bg 계정의 크레딧이 소진됨

### 영향 받는 기능
현재 Remove.bg API를 사용하는 두 가지 기능이 있습니다:

1. **Ben의 이미지 합성 서비스** (`ben-process-images`)
   - 두 제품 이미지의 배경 제거 후 합성
   - PTO Gallery에서 사용

2. **Kai의 배경 제거 서비스** (`fotor-background-removal`)
   - 사용자 업로드 이미지의 배경 제거
   - 단독 background removal 기능

## 해결 방안

### 방안 1: Remove.bg 크레딧 충전 (즉시 해결)
가장 빠른 해결책은 Remove.bg 계정에 크레딧을 추가하는 것입니다:

**작업 단계:**
1. [Remove.bg Dashboard](https://www.remove.bg/dashboard#api)에 로그인
2. API 사용량 및 잔여 크레딧 확인
3. 크레딧 구매 (가격표: https://www.remove.bg/pricing/api)
   - 40 크레딧: $9.00
   - 200 크레딧: $39.00
   - 1,000 크레딧: $179.00

**예상 소요 시간:** 즉시 (결제 완료 후 바로 사용 가능)

### 방안 2: Fotor API로 전환 (대안 API 사용)
현재 Fotor API 키가 secrets에 이미 설정되어 있으므로, Remove.bg 대신 Fotor Background Remover API로 전환할 수 있습니다.

**장점:**
- 이미 API 키 설정 완료
- Remove.bg와 유사한 품질
- 별도의 크레딧 구매 불필요 (Fotor 크레딧 상황에 따라)

**작업 내용:**
1. `ben-process-images/index.ts` 수정
   - Remove.bg API 호출 로직을 Fotor API로 변경
   - API 엔드포인트: `https://api-b.fotor.com/v1/aiart/backgroundremover`
   - Bearer Token 인증 방식 적용

2. `fotor-background-removal/index.ts` 유지
   - 이미 Fotor API를 호출하도록 설정되어 있지만 실제로는 Remove.bg를 호출 중
   - 함수명과 실제 구현을 일치시키도록 수정

**예상 소요 시간:** 30분 (코드 수정 + 테스트)

**기술적 상세:**
```typescript
// Fotor API 호출 구조
const response = await fetch('https://api-b.fotor.com/v1/aiart/backgroundremover', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${FOTOR_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image_base64: imageBase64,
    format: 'png'
  }),
});
```

### 방안 3: 하이브리드 접근 (장기 안정성)
두 API를 모두 유지하고 fallback 로직을 구현:

**구현 방식:**
1. 기본: Remove.bg 사용 (더 빠른 처리 속도)
2. Fallback: Remove.bg 실패 시 자동으로 Fotor API 호출
3. 에러 핸들링: 두 API 모두 실패 시 사용자에게 명확한 에러 메시지 표시

**예상 소요 시간:** 1시간 (fallback 로직 구현 + 테스트)

## 권장 해결 순서

### 즉시 조치 (5분)
1. Remove.bg 대시보드에서 현재 크레딧 잔량 확인
2. 크레딧이 0인지 확인

### 단기 해결 (선택 1 또는 2)
- **Option A**: Remove.bg 크레딧 충전 → 즉시 사용 가능
- **Option B**: Fotor API로 코드 수정 → 30분 소요

### 장기 안정성 (선택사항)
- 방안 3 (하이브리드) 구현으로 향후 유사한 문제 방지

## 기술 세부사항

### 현재 아키텍처
```
사용자 → Frontend
         ↓
    Edge Function (ben-process-images / fotor-background-removal)
         ↓
    Remove.bg API (402 Error - Insufficient Credits)
         ↓
    실패 반환
```

### 수정 후 아키텍처 (방안 2 선택 시)
```
사용자 → Frontend
         ↓
    Edge Function
         ↓
    Fotor API (Bearer Token 인증)
         ↓
    성공적인 배경 제거 결과 반환
```

### 수정 후 아키텍처 (방안 3 선택 시)
```
사용자 → Frontend
         ↓
    Edge Function
         ↓
    Remove.bg API (Primary)
         ↓
    성공? → 반환
    실패? ↓
    Fotor API (Fallback)
         ↓
    성공 → 반환
    실패 → 에러 메시지
```

## 예상 비용

### Remove.bg API (방안 1)
- 40 크레딧: $9.00 (이미지 40개 처리 가능)
- 200 크레딧: $39.00 (이미지 200개 처리 가능)

### Fotor API (방안 2)
- 현재 설정된 API 키의 크레딧 상황에 따라 다름
- Fotor 대시보드에서 확인 필요

## 다음 단계

어떤 해결 방안을 선택하시겠습니까?

1. **즉시 해결**: Remove.bg 크레딧 충전
2. **코드 수정**: Fotor API로 전환
3. **안정적 운영**: 하이브리드 접근 (두 API 모두 사용)

선택하신 방안에 따라 즉시 구현을 진행하겠습니다.
