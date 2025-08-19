# 모각코어 (MogakCore)

커뮤니티 멤버들이 지정된 '코어 타임'의 참여 현황을 실시간으로 확인하여, 함께 코딩하는 분위기를 조성하고 자발적인 모각코 참여를 유도하는 서비스입니다.

## 🚀 주요 기능

- **실시간 참여 현황**: 4개 코어 타임(10시, 15시, 20시, 22시)별 참여 인원 실시간 확인
- **익명 참여 시스템**: 로그인 없이 브라우저 ID 기반 익명 참여
- **간편한 참여/취소**: 3클릭 이내의 직관적인 UI
- **비밀번호 보안**: 4자리 숫자 비밀번호로 참여 취소 보호
- **시각적 피드백**: 참여 인원에 비례한 프로그레스 바 표시

## 🛠 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB Atlas
- **Security**: bcryptjs (비밀번호 해싱), Rate Limiting
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mogakcore?retryWrites=true&w=majority

# Upstash Redis for Rate Limiting (선택사항)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Environment
NODE_ENV=development
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/           # API 엔드포인트
│   │   ├── status/    # 참여 현황 조회
│   │   ├── participate/# 참여 신청
│   │   ├── cancel/    # 참여 취소
│   │   └── reset/     # 데이터 초기화
│   ├── layout.tsx     # 루트 레이아웃
│   └── page.tsx       # 메인 페이지
├── components/        # React 컴포넌트
├── lib/              # 라이브러리 설정
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
```

## 🔧 API 엔드포인트

### GET /api/status
특정 날짜의 코어 타임별 참여 인원 수 조회

**Query Parameters:**
- `date`: 조회할 날짜 (YYYY-MM-DD, 기본값: 오늘)

**Response:**
```json
{
  "success": true,
  "data": {
    "1000": 5,
    "1500": 3,
    "2000": 8,
    "2200": 2
  }
}
```

### POST /api/participate
코어 타임 참여 신청

**Request Body:**
```json
{
  "date": "2025-01-20",
  "time": "2000",
  "browserId": "uuid-string",
  "password": "1234"
}
```

### POST /api/cancel
코어 타임 참여 취소

**Request Body:**
```json
{
  "date": "2025-01-20",
  "time": "2000",
  "browserId": "uuid-string",
  "password": "1234"
}
```

### GET /api/reset
24시간 이전 데이터 정리 (Cron Job용)

## 🗄 데이터베이스 스키마

### participations 컬렉션
```javascript
{
  "_id": ObjectId("..."),
  "date": "2025-01-20",        // 참여 날짜
  "coreTime": "2000",          // 코어 타임 (HHMM)
  "browserId": "uuid-string",  // 브라우저 식별자
  "passwordHash": "$2a$10$...", // 해시된 비밀번호
  "createdAt": ISODate("...")  // 생성 시각 (TTL 인덱스)
}
```

## 🔒 보안 기능

- **Rate Limiting**: IP 기반 API 호출 제한 (10초당 10회)
- **비밀번호 해싱**: bcrypt를 사용한 비밀번호 보안
- **TTL 인덱스**: 24시간 후 자동 데이터 삭제
- **입력 검증**: 모든 API 요청에 대한 철저한 검증

## 🚀 배포

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 완료

### MongoDB Atlas 설정
1. MongoDB Atlas 클러스터 생성
2. 데이터베이스 사용자 생성
3. IP 화이트리스트 설정
4. 연결 문자열 복사하여 환경 변수 설정

## 📝 개발 노트

- 클라이언트에서 3-5초 주기로 참여 현황 폴링
- 브라우저 로컬 스토리지를 통한 참여 상태 관리
- 완전 익명 시스템으로 개인정보 수집 없음
- 반응형 디자인으로 모바일 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

## 📧 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/yourusername/mogakcore/issues)