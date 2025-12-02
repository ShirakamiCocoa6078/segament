# API 호출 방식 안내

이 문서는 프로젝트의 새로운 API 아키텍처에 따른 호출 방법을 안내합니다. API는 크게 **시스템 API(내부용)**와 **퍼블릭 API(외부용)**로 나뉩니다.

---

## 1. 시스템 API (Internal System API)

웹 프론트엔드, 디스코드 봇 등 신뢰할 수 있는 내부 시스템에서 사용하는 API입니다.

### 가. 현재 로그인된 사용자 프로필 조회 (세션 인증)

-   **용도:** 웹사이트에 로그인한 사용자가 자신의 프로필 정보를 가져올 때 사용합니다.
-   **엔드포인트:** `GET /api/system/v1/profile`
-   **인증:** NextAuth.js 세션 (별도 헤더 필요 없음)
-   **쿼리 파라미터 (필수):**
    -   `gameType`: `CHUNITHM` | `MAIMAI`
    -   `region`: `JP` | `INT`
-   **요청 예시 (웹 프론트엔드):**
    ```javascript
    // 사용자의 CHUNITHM 일본 서버 프로필을 요청
    fetch('/api/system/v1/profile?gameType=CHUNITHM&region=JP')
      .then(res => res.json())
      .then(profile => {
        console.log(profile);
      });
    ```

### 나. 특정 사용자 프로필 조회 (시스템 키 인증)

-   **용도:** 디스코드 봇과 같이 백엔드에서 특정 유저(`userId`)의 공개 프로필을 조회할 때 사용합니다.
-   **엔드포인트:** `GET /api/system/v1/profile/{userId}`
-   **인증:** `Authorization: Bearer <SYSTEM_SECRET_KEY>`
    -   `<SYSTEM_SECRET_KEY>`는 `.env` 파일에 정의된 시스템 전용 비밀 키입니다.
-   **쿼리 파라미터 (필수):**
    -   `gameType`: `CHUNITHM` | `MAIMAI`
    -   `region`: `JP` | `INT`
-   **요청 예시 (`curl`):**
    ```bash
    # 'Player123' 유저의 CHUNITHM 국제 서버 프로필을 요청
    curl -X GET "https://your-domain.com/api/system/v1/profile/Player123?gameType=CHUNITHM&region=INT" \
         -H "Authorization: Bearer YOUR_SYSTEM_SECRET_KEY"
    ```

---

## 2. 퍼블릭 API (Public API)

제3자 개발자 등 외부 사용자가 자신의 데이터에 접근할 수 있도록 제공되는 API입니다.

### 가. 내 프로필 조회 (사용자 API 키 인증)

-   **용도:** 외부 애플리케이션에서 사용자 본인의 데이터에 접근할 때 사용합니다.
-   **엔드포인트:** `GET /api/public/v1/profile`
-   **인증:** `Authorization: Bearer <USER_API_KEY>`
    -   `<USER_API_KEY>`는 각 사용자에게 발급된 고유 API 키입니다.
-   **참고:** 현재 이 엔드포인트는 인증 성공 여부만 확인하는 **템플릿 상태**이며, 실제 프로필 데이터를 반환하지는 않습니다.
-   **요청 예시 (`curl`):**
    ```bash
    curl -X GET "https://your-domain.com/api/public/v1/profile" \
         -H "Authorization: Bearer USER_GENERATED_API_KEY"
    ```
