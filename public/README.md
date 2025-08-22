# CHUNITHM 자켓 이미지 자동 수집 및 다운로드

## 준비 사항
1. Node.js 설치
2. Playwright, axios 등 패키지 설치
```bash
   npm install playwright axios dotenv
```
3. `.env` 파일에 SEGA_ID, SEGA_PASSWORD 입력
```bash
   SEGA_ID=your_sega_id
   SEGA_PASSWORD=your_sega_password
```

## 실행 순서

### 1. 자켓 데이터 수집 및 변환


node collect_and_convert.js

- `jacket_data.json`과 `jacket-urls.json`이 생성됩니다.

### 2. 자켓 이미지 다운로드
```bash
node download_jacket_images.js
```
- `jacket_image` 폴더에 이미지가 저장됩니다.

## 참고
- 수집/다운로드 중간에 오류가 발생하면 로그를 확인하세요.
- 이미지 다운로드는 병렬로 처리되며, 네트워크 상황에 따라 시간이 소요될 수 있습니다.
