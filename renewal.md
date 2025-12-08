# segament 프로젝트 Renewal 설계

## 리뉴얼 완료 폴더/파일

- .idx, .next, .temp, .vscode, docs, node_modules, prisma : DB 스키마 변경과 무관, 데이터 충돌 없음 → **리뉴얼 완료**
- apphosting.yaml, components.json, declarations.d.ts, next-auth.d.ts, next-env.d.ts, next.config.ts, package.json, package-lock.json, postcss.config.mjs, tailwind.config.ts, tsconfig.json, tsconfig.tsbuildinfo : DB와 무관, 데이터 충돌 없음 → **리뉴얼 완료**
- public : 정적 데이터/이미지/스크립트/환경설정 등, DB와 무관 → **리뉴얼 완료**
- songDataScript : 곡/카테고리 데이터 가공/생성용, DB와 무관 → **리뉴얼 완료**
- src/lib/userService.ts : userId→id 매핑만, DB 충돌 없음 → **리뉴얼 완료**
- src/hooks : 커스텀 훅(모바일, 토스트 등), DB와 무관 → **리뉴얼 완료**
- src/components/ui, src/components/icons.tsx : UI/아이콘 컴포넌트, DB와 무관 → **리뉴얼 완료**
- src/components/auth : 인증 UI 컴포넌트, DB와 무관 → **리뉴얼 완료**

---


- src/types/index.ts : 타입 정의(userId, id 등) → **리뉴얼 완료**
- src/lib/dataService.ts : userId/userSystemId 혼용, Prisma 직접 사용 → **리뉴얼 완료**
- src/lib/auth.ts : PrismaAdapter 프록시, 세션/토큰 구조 등 → **리뉴얼 필요**

---


- src/app (폴더 내 개별 파일: favicon.ico, globals.css, layout.tsx, page.tsx 등) : 정적 리소스/글로벌 스타일/루트 레이아웃/홈페이지, DB 스키마와 직접 결합된 로직 없음 → **리뉴얼 완료**
- src/components (일반 컴포넌트)

---

- src/components/dashboard : 곡/프로필/플레이로그 등 UI 컴포넌트, DB 스키마와 직접 결합된 로직 없음 → **리뉴얼 완료**

- src/app/[userId] (구 [id]) : 폴더명 및 내부 파라미터 userId로 일원화, 데이터 참조용 cuid는 별도 변환 함수로 유지, DB 스키마 충돌 없음 → **리뉴얼 완료**
