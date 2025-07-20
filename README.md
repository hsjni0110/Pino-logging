# MongoDB Slow Query Detection System

Node.js + MongoDB 환경에서 슬로우 쿼리를 실시간으로 탐지하고 로깅하는 개발용 시스템입니다.

## 주요 기능

- **실시간 쿼리 모니터링**: MongoDB의 모든 쿼리 실행 시간을 실시간으로 추적
- **슬로우 쿼리 탐지**: 설정된 임계값을 초과하는 쿼리를 자동으로 감지하고 경고
- **상세한 쿼리 정보**: 컬렉션명, 필터 조건, aggregation pipeline 등 상세 정보 제공
- **성능 최적화**: 로깅 시스템 자체가 애플리케이션 성능에 미치는 영향 최소화
- **가독성 높은 로그**: pino-pretty를 통한 컬러풀하고 읽기 쉬운 로그 출력

## 프로젝트 구조

```
├── server.js                    # 메인 서버 실행 파일
├── src/
│   ├── app.js                  # Koa 앱 설정 및 미들웨어 구성
│   ├── config/
│   │   ├── logger.js           # Pino 로거 설정
│   │   └── database.js         # MongoDB 클라이언트 + 쿼리 모니터링
│   ├── middleware/
│   │   └── mongo.js            # MongoDB 연결 미들웨어
│   └── routes/
│       └── api.js              # 테스트용 API 라우트
├── seed.js                     # 테스트 데이터 생성 스크립트
└── .env                        # 환경 변수 설정
```

## 🛠 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 설정을 추가하세요:

```env
# MongoDB 연결 URI
MONGO_URI=mongodb://localhost:27017

# 슬로우 쿼리 탐지 설정
SLOW_LOGGING=true
SLOW_QUERY_THRESHOLD=200

# 로깅 설정
LOG_LEVEL=info
LOG_DEST=./app.log

# 테스트용 지연 시간 (ms) - 개발/테스트 시에만 사용
SIMULATED_DELAY=0

# 서버 포트
PORT=3000
```

### 3. 테스트 데이터 생성 (선택사항)

```bash
node seed.js
```

### 4. 서버 실행

```bash
node server.js
```

## 테스트 API 엔드포인트

서버 실행 후 다음 엔드포인트로 쿼리를 테스트할 수 있습니다:

```bash
# 성인 사용자 조회 (find 쿼리)
curl http://localhost:3000/api/users/adults

# 매출 상위 상품 조회 (aggregate 쿼리)
curl http://localhost:3000/api/orders/top-sales

# 월별 수익 분석 (복잡한 aggregate 쿼리)
curl http://localhost:3000/api/analytics/monthly-revenue
```

## 로그 출력 예시

<img width="691" height="157" alt="image" src="https://github.com/user-attachments/assets/f7c28194-e6f9-47bf-881b-09db8f20ffda" />

### 일반 쿼리
```
[2025-07-20 15:30:25] INFO: find on users (45ms) filter={"age":{"$gte":18}}
```

### 슬로우 쿼리
```
[2025-07-20 15:30:26] WARN: SLOW: aggregate on orders (250ms) pipeline=$match→$group→$sort→$limit
```

### 쿼리 실패
```
[2025-07-20 15:30:27] ERROR: find on users FAILED
```

## 커스터마이징

### 1. 슬로우 쿼리 임계값 변경

```env
SLOW_QUERY_THRESHOLD=100  # 100ms 이상을 슬로우 쿼리로 간주
```

## 주의사항

1. **개발 환경 전용**: 이 시스템은 개발/테스트 환경에서의 사용을 권장합니다.
2. **프로덕션 사용 시**: 프로덕션에서 사용할 경우 로그 레벨을 조정하고 필요한 보안 검토를 수행하세요.
3. **메모리 사용량**: 대량의 쿼리가 발생하는 환경에서는 메모리 사용량을 모니터링하세요.

## 의존성

- **Node.js**: 18+
- **MongoDB**: 4.0+
- **주요 패키지**:
  - `koa` - 웹 프레임워크
  - `mongodb` - MongoDB 드라이버
  - `pino` - 고성능 로거
  - `pino-pretty` - 로그 포매터
