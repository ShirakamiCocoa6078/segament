## 주요 기능 및 구조 정리

### 1. API 엔드포인트 및 이미지 생성

- **경로:** `/api/v1/img/MakeRatingImg?profileId=...`
- **기능:** DB에서 profileId에 해당하는 게임 데이터(ratingLists)를 조회하여, 곡별 상세 정보(상수, 레벨, 장르, 버전, 곡ID, 자켓URL, 난이도, 랭크, 획득 레이팅 등)를 이미지로 렌더링하여 반환합니다.
- **주요 로직:**
  - PrismaClient로 DB 연결 및 GameData 조회
  - ratingLists(best/new) 추출
  - `chunithmSongData.json`에서 곡별 상수/레벨/장르/버전 등 참조
  - `jacket_data.json`에서 곡별 자켓 이미지 URL 참조
  - 점수→랭크 변환(scoreToRank)
  - 레이팅 계산(`src/lib/ratingUtils.ts`의 calculateRating 함수 사용)
  - 곡별 정보 구조화 및 이미지 렌더링(`@vercel/og` 활용)
  - 에러 발생 시 500 반환

### 2. 레이팅 계산 함수

- **파일:** `src/lib/ratingUtils.ts`
- **함수:** `calculateRating(constant: number, score: number): number`
  - 곡 상수와 점수를 기반으로 단일 곡 레이팅 값을 계산
  - SSS+, SSS, SS+, SS, S+, S, AAA, AA, A, BBB 등 점수 구간별 공식 적용

### 3. 데이터베이스 구조 (Prisma)

#### 1. User

- **설명:** 서비스 회원(유저) 정보
- **주요 필드:**
  - `id`: 고유 식별자 (cuid)
  - `name`, `username`, `email`, `emailVerified`, `image`
  - `createdAt`, `updatedAt`
  - `accounts`: 외부 계정 연동 정보 (Account 모델과 관계)
  - `sessions`: 로그인 세션 정보 (Session 모델과 관계)
  - `gameProfiles`: 게임 프로필 정보 (GameProfile 모델과 관계)

#### 2. Account

- **설명:** 외부 인증/연동 계정 정보 (예: Google, Discord 등)
- **주요 필드:**
  - `id`: 고유 식별자
  - `userId`: User와 관계
  - `type`, `provider`, `providerAccountId`
  - `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`
  - `user`: User 모델과 관계

#### 3. Session

- **설명:** 로그인 세션 정보
- **주요 필드:**
  - `id`: 고유 식별자
  - `sessionToken`: 세션 토큰
  - `userId`: User와 관계
  - `expires`: 만료일시
  - `user`: User 모델과 관계

#### 4. VerificationToken

- **설명:** 이메일 인증 등에서 사용되는 토큰 정보
- **주요 필드:**
  - `identifier`: 인증 대상 식별자
  - `token`: 인증 토큰
  - `expires`: 만료일시

#### 5. GameProfile

- **설명:** 유저별 게임 프로필(게임별, 지역별, 플레이어명 등)
- **주요 필드:**
  - `id`: 고유 식별자
  - `userId`: User와 관계
  - `gameType`: 게임 종류 (예: chunithm)
  - `region`: 지역
  - `playerName`: 게임 내 닉네임
  - `rating`: 현재 레이팅
  - `overPower`: 오버파워(추가 능력치)
  - `level`: 플레이어 레벨
  - `playCount`: 플레이 횟수
  - `honors`: 칭호 등(자유 Json)
  - `teamName`, `lastPlayDate`, `battleRankImg`, `friendCode`
  - **신규 필드:** 팀 엠블럼 색상, 코스 엠블럼, 캐릭터 이미지/배경, 네임플레이트 이미지 등
    - `teamEmblemColor`, `classEmblemTop`, `classEmblemBase`, `characterImage`, `characterBackground`, `nameplateImage`
  - **레이팅 히스토리:** `ratingHistory` (날짜별 레이팅 변화 기록, Json)
  - **프로필 공개여부:** `isPublic` (Boolean)
  - `createdAt`, `updatedAt`
  - `user`: User와 관계
  - `gameData`: GameData와 1:1 관계
  - **고유조건:** userId, gameType, region 조합이 유일

#### 6. GameData

- **설명:** 게임별 플레이 기록 및 레이팅 리스트 저장 (GameProfile과 1:1 관계)
- **주요 필드:**
  - `id`: 고유 식별자
  - `profileId`: GameProfile과 1:1 관계 (고유)
  - `playlogs`: 플레이 기록 전체(Json, 곡별 기록/클리어타입/콤보타입 등)
  - `ratingLists`: 레이팅 리스트(Json, best/new 등)
  - `updatedAt`
  - `profile`: GameProfile과 관계

### 4. 곡 데이터 참조 파일

- **`src/lib/chunithmSongData.json`**
  - 곡별 id, title, genre, version, 각 난이도별 상수/레벨 정보 포함
- **`src/lib/jacket_data.json`**
  - 곡별 id(idx), title, jacketUrl(자켓 이미지 URL) 포함

### 5. 전체 API/DB 사용 흐름

1. 클라이언트에서 `/api/v1/img/MakeRatingImg?profileId=...`로 GET 요청
2. 서버에서 Prisma로 GameData(profileId 기준) 조회
3. ratingLists(best/new)에서 곡별 점수/난이도/ID 추출
4. chunithmSongData.json, jacket_data.json에서 곡별 상세 정보 매칭
5. calculateRating 함수로 레이팅 계산, scoreToRank로 랭크 변환
6. 곡별 모든 정보(상수, 레벨, 장르, 버전, 자켓URL, 랭크, 레이팅 등) 구조화
7. 이미지로 렌더링하여 반환

---

# public 폴더 구조 및 역할

## 1. data/

- **jacket_data.json**
  - 곡별 자켓 이미지 정보(id, title, jacketUrl 등) 제공
  - 곡 데이터와 자켓 이미지 매칭에 사용

## 2. img/

- **아이콘 이미지**
  - `icon_alljustice.png`, `icon_alljusticecritical.png`, `icon_fullcombo.png`
    - 곡별 클리어타입/콤보타입(풀콤보, AJ, AJC 등) 표시용 아이콘
  - 랭크 이미지(`S.png`, `S+.png`, `SS.png`, `SS+.png`, `SSS.png`, `SSS+.png`)
    - 곡별 랭크(점수 등급) 표시용

## 3. jacket/

- **곡별 자켓 이미지(jpg)**
  - 곡 id별로 실제 자켓 이미지 파일 저장
  - 곡 카드, 이미지 렌더링 등에 사용

## 4. playLogs/

- **image/**
  - 플레이 기록 관련 이미지(예: 플레이 기록 시각화, 클리어타입 등 표시용)

## 5. fonts/

- **커스텀 폰트 파일**
  - 이미지 렌더링, UI 디자인에 사용

## 6. scripts/

- **collect_and_convert.js**
  - 곡/자켓 데이터 수집 및 변환 스크립트
- **download_jacket_images.js**
  - 곡별 자켓 이미지 자동 다운로드 스크립트

## 7. 기타 파일

- **jacket_data.json, jacket-urls.json**
  - 곡별 자켓 이미지 정보 및 URL 목록
- **package.json**
  - scripts 폴더 내 Node.js 스크립트 실행 환경 정의
- **README.md**
  - public 폴더 내 데이터/이미지/스크립트 구조 및 사용법 설명

---

# songDataScript 폴더 구조 및 역할

## 1. 주요 목적
- Chunithm 곡/카테고리 데이터의 수집, 통합, 변환, 가공을 위한 스크립트 및 데이터 관리

## 2. 주요 파일 및 폴더

### integrated_script.js
- **기능:** chunithmSongData2.json, chunithm-category-data.json 등 원본/외부 데이터를 통합, 가공하여 최종 곡 데이터(JSON) 생성
- **역할:** 곡별 상수/레벨/장르/버전/카테고리 등 통합, 중복/누락 데이터 보정, 결과 파일로 내보내기

### chunithmSongData2.json
- **기능:** 원본/외부에서 수집된 Chunithm 곡 데이터(상수, 레벨, 장르, 버전 등 포함)
- **역할:** 스크립트에서 가공/통합의 입력 데이터로 사용

### chunithm-category-data.json
- **기능:** 곡별 카테고리(장르, 버전 등) 정보 데이터
- **역할:** 곡 데이터와 매칭하여 곡별 상세 정보 보강

### results/
- **chunithmSongData.json:**  
  - integrated_script.js 실행 결과로 생성된 최종 곡 데이터(JSON)
  - 실제 서비스/DB/API에서 참조하는 표준 곡 데이터
- **chunithm-category-data.json:**  
  - 카테고리 정보의 결과/가공본

### log.md
- **기능:** 데이터 변환/통합 과정의 로그, 작업 내역, 오류/보정 내역 기록

### package.json
- **기능:** Node.js 스크립트 실행 환경 및 의존성 관리

### .env
- **기능:** 외부 API 키, 경로 등 환경 변수 관리

### README.md
- **기능:** songDataScript 폴더 내 데이터/스크립트 구조 및 사용법 설명

## 3. 데이터 처리 흐름 예시

1. chunithmSongData2.json, chunithm-category-data.json 등 원본 데이터 준비
2. integrated_script.js에서 데이터 통합/가공/보정
3. results 폴더에 chunithmSongData.json 등 최종 데이터 생성
4. log.md에 작업 내역/오류/보정 기록
5. 서비스/DB/API에서 results/chunithmSongData.json을 참조하여 곡별 상세 정보 제공

---

# 프론트엔드 곡 정보 표시 구조 및 활용 예시

## MakeRatingImg.tsx

- API에서 반환된 곡별 상세 정보(상수, 레벨, 랭크, 획득 레이팅, 클리어타입, 자켓 이미지 등)를 받아 이미지로 렌더링
- 각 곡별로 카드 형태로 곡명, 점수, 난이도, 랭크, 레벨, 상수, 획득 레이팅, 클리어타입/콤보타입 아이콘, 자켓 이미지 등을 표시
- UI/이미지 스타일은 public/img, public/jacket, public/fonts의 리소스를 활용

## ChunithmSongCard.tsx

- 곡별 카드 컴포넌트로, 곡 데이터(상수, 레벨, 장르, 자켓 이미지 등)를 받아 UI에 표시
- 클리어타입/콤보타입 아이콘, 랭크 이미지 등도 함께 표시 가능

## 데이터 흐름 예시

1. DB에서 ratingLists.best/new, playlogs 등 곡별 기록 추출
2. API(route.ts)에서 곡별 상세 정보 구조화 및 이미지 렌더링
3. 프론트에서 곡별 카드/이미지 컴포넌트로 표시
4. public 폴더의 이미지/폰트/자켓 리소스를 활용해 UI 완성

---

# 기타 참고 사항

- 모든 데이터/이미지/스크립트/컴포넌트는 실제 곡별 정보와 UI에 최대한 상세하게 반영되도록 설계
- 각 파일/폴더/컴포넌트의 역할과 데이터 흐름을 명확히 구분하여 유지보수 및 확장에 용이하게 작성

---

# src 폴더 구조 및 주요 역할

## 1. app/
- **Next.js 13+ App Router 기반 폴더**
- **주요 역할:** 전체 페이지/레이아웃/라우팅 관리, 사용자별 대시보드/프로필/게임별 상세 페이지 등 UI 렌더링

### 주요 파일/폴더 해설
- `layout.tsx`, `globals.css`, `favicon.ico`: 전체 앱 레이아웃, 글로벌 스타일, 파비콘
- `page.tsx`: 메인(루트) 페이지
- `[userId]/`: 동적 라우팅(사용자별 대시보드/프로필)
  - `layout.tsx`: 사용자별 레이아웃
  - `account/page.tsx`: 계정 정보/설정 페이지
  - `chunithm/calc/const/`: Chunithm 레이팅/상수 계산 관련 페이지
  - `dashboard/page.tsx`: 사용자별 대시보드(요약/통계)
  - `dashboard/detail/chunithm/`, `dashboard/detail/maimai/`: 게임별 상세 기록/통계 페이지
- `auth/verify/page.tsx`: 이메일 인증/계정 검증 페이지
- `bookmarklet/page.tsx`: 북마클릿 기능 안내/설치 페이지
- `figma-test/page.tsx`: Figma 연동 테스트/샘플 페이지
- `import/page.tsx`: 외부 데이터/플레이 기록 등 임포트 기능 페이지
- `profile/privacy/page.tsx`: 프로필 공개/비공개 설정 페이지
- `signup/page.tsx`: 회원가입 페이지

## 2. api/
- **Next.js API Route 기반 폴더**
- **주요 역할:** 인증, 계정 관리, 게임 프로필, 대시보드, 이미지 생성, 데이터 임포트 등 백엔드 API 제공

### 주요 라우터 해설
- `account/`
  - `check-username/route.ts`: 닉네임 중복 체크 API
  - `delete-account/route.ts`: 계정 삭제 API
  - `game-profile/route.ts`: 게임 프로필 생성/수정 API
  - `update-profile/route.ts`: 계정 정보 수정 API
- `auth/`
  - `[...nextauth]/route.ts`: NextAuth 기반 인증 API(로그인/로그아웃/세션)
  - `check-registration/route.ts`: 회원가입 여부 체크 API
  - `check-username/route.ts`: 닉네임 중복 체크 API
  - `register/route.ts`: 회원가입 처리 API
- `dashboard/`
  - `route.ts`: 대시보드 요약 데이터 API
  - `detail/route.ts`: 대시보드 상세 데이터 API
  - `play-percent/`: 게임별 플레이 비율/통계 API
- `profile/detail/`, `profile/public/`: 프로필 상세/공개 정보 API
- `user/profile-status/`: 유저 상태/프로필 정보 API
- `v1/img/`: 레이팅 이미지 생성 API(곡별 상세 정보 포함)
- `v1/import/`: 외부 데이터 임포트 API

## 3. bookmarklet/
- **북마클릿 기능 안내/설치 페이지**
- **역할:** 외부 사이트에서 곡/플레이 기록을 쉽게 추출할 수 있는 북마클릿 스크립트 안내 및 설치

## 4. import/
- **외부 데이터 임포트 기능 페이지**
- **역할:** Chunithm 등 게임 기록/데이터를 외부 파일/사이트에서 불러와서 DB에 저장하는 UI/기능 제공

---

## [중요 페이지/라우터 상세 해설]

### app/[userId]/dashboard/page.tsx
- 사용자별 대시보드(요약/통계) 페이지
- 최근 플레이 기록, 레이팅 변화, 주요 곡/랭크/통계 등 시각화

### app/[userId]/dashboard/detail/chunithm/
- Chunithm 게임별 상세 기록/통계 페이지
- 곡별 점수, 랭크, 클리어타입, 레이팅 등 상세 정보 표시

### app/[userId]/account/page.tsx
- 계정 정보/설정 페이지
- 이메일, 닉네임, 프로필 이미지 등 계정 관리 UI

### api/v1/img/
- 곡별 상세 정보(상수, 레벨, 랭크, 자켓, 클리어타입 등) 기반 이미지 생성 API
- 프론트 MakeRatingImg.tsx 등에서 활용

### api/account/game-profile/route.ts
- 게임 프로필 생성/수정 API
- DB에 GameProfile/게임별 정보 저장/수정

### api/auth/[...nextauth]/route.ts
- NextAuth 기반 인증/세션 관리 API
- 로그인/로그아웃/소셜 인증 등 처리

---

# src/components 폴더 해설

## 1. icons.tsx
- 공통 아이콘 컴포넌트 및 SVG 아이콘 정의

## 2. auth/
- **auth-provider.tsx:** 인증 컨텍스트/Provider 컴포넌트
- **login-form.tsx:** 로그인 폼 UI 및 인증 처리
- **signup-form.tsx:** 회원가입 폼 UI 및 처리

## 3. dashboard/
- **AllRecordsDisplay.tsx:** 전체 플레이 기록/통계 표시
- **ChunithmSongCard.tsx:** Chunithm 곡별 카드(상수, 레벨, 랭크, 자켓 등 표시)
- **ChunithmSongGrid.tsx:** 곡 카드 그리드(곡 목록/통계 시각화)
- **header.tsx:** 대시보드 헤더/네비게이션
- **MakeRatingImg.tsx:** 곡별 상세 정보 기반 이미지 렌더링(자켓, 랭크, 클리어타입 등)
- **PlayerCard.tsx:** 플레이어 정보 카드(프로필, 레이팅 등)
- **PlaylogTable.tsx:** 플레이 기록 테이블(곡별 점수, 클리어타입 등)
- **profile-display.tsx:** 프로필 정보 표시
- **ProfileCard.tsx:** 유저 프로필 카드
- **RegisterProfileDialog.tsx:** 게임 프로필 등록/수정 다이얼로그
- **sidebar-nav.tsx:** 대시보드/앱 사이드바 네비게이션
- **SongDataTable.tsx:** 곡 데이터 테이블(상수, 레벨, 장르 등)
- **SongRatingTable.tsx:** 곡별 레이팅 테이블
- **SongRecordCard.tsx:** 곡별 플레이 기록 카드

## 4. ui/
- **accordion.tsx ~ use-toast.ts:**  
  - 공통 UI 컴포넌트(아코디언, 다이얼로그, 버튼, 카드, 차트, 폼, 입력, 토스트, 테이블 등)
  - 앱 전체에서 재사용되는 디자인 시스템 기반 컴포넌트

---

# src/lib 폴더 해설

## 1. api.ts
- 백엔드 API 호출/통신 함수

## 2. auth.ts
- 인증 관련 유틸 함수(토큰, 세션 등)

## 3. bookmarklet.ts
- 북마클릿 기능 관련 유틸/스크립트

## 4. chunithm-category-data.json
- Chunithm 곡별 카테고리(장르, 버전 등) 데이터

## 5. chunithmSongData.json
- Chunithm 곡별 상세 데이터(상수, 레벨, 장르, 버전 등)

## 6. const-overrides.json
- 곡별 상수/레벨/데이터 오버라이드(수정/보정용)

## 7. constants.ts
- 앱 전체에서 사용하는 상수값 정의

## 8. env.ts
- 환경 변수/설정값 관리

## 9. jacket_data.json
- 곡별 자켓 이미지 정보(id, title, jacketUrl 등)

## 10. mock-data.ts
- 테스트/개발용 목업 데이터

## 11. prisma.ts
- Prisma ORM 클라이언트/DB 연결 유틸

## 12. ratingUtils.ts
- 레이팅 계산 함수(상수+점수 기반 공식)

## 13. utils.ts
- 공통 유틸 함수(데이터 가공, 포맷 변환 등)

