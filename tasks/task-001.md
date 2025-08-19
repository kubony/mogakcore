# Task-001: 프로젝트 초기 설정 및 구조 생성

## 목표
Next.js 프로젝트를 초기화하고 모각코어 서비스 개발에 필요한 기본 구조를 생성한다.

## 상세 작업 항목
1. Next.js 프로젝트 초기화
2. 필요한 의존성 패키지 설치
   - bcryptjs (비밀번호 해싱)
   - mongodb (MongoDB 연결)
   - @upstash/ratelimit (Rate limiting)
   - uuid (browserId 생성)
3. 기본 폴더 구조 생성
4. 환경 변수 설정 파일 생성
5. 기본 설정 파일들 구성

## 예상 소요 시간
30-45분

## 상태
진행 중

## 진행 상황
- [x] Next.js 프로젝트 초기화
- [x] package.json 의존성 설치
- [x] 폴더 구조 생성
- [x] 환경 변수 파일 생성
- [x] 기본 설정 완료

## 회고
### Fact
- Next.js 14 프로젝트를 TypeScript, Tailwind CSS, ESLint와 함께 성공적으로 초기화
- bcryptjs, mongodb, @upstash/ratelimit, uuid 등 필요한 의존성 패키지 설치 완료
- src/lib, src/components, src/types, src/utils 폴더 구조 생성
- 환경 변수 파일(.env.local, .env.example) 생성
- 기본 타입 정의, 유틸리티 함수, MongoDB 연결, Rate limiting 라이브러리 구현

### 잘한 점
- PRD 요구사항을 정확히 반영한 기술 스택 선택
- 체계적인 폴더 구조와 타입 정의로 개발 효율성 확보
- 환경 변수 분리로 보안성 고려
- MongoDB TTL 인덱스 설정으로 자동 데이터 정리 구현

### 아쉬운 점
- 기존 파일 충돌로 인한 백업/복원 과정 필요

### 개선할 점
- MongoDB Atlas 실제 연결 테스트 필요
- API 엔드포인트 구현으로 진행