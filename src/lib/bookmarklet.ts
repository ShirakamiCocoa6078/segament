// 파일 경로: src/lib/bookmarklet.ts

// [수정] Chrome의 자동 인코딩 문제를 피하기 위해 내부 문자열에 큰따옴표(")를 사용하고,
// new Date().getTime()을 더 간결한 Date.now()로 변경한 안정적인 버전입니다.
export const bookmarkletLoaderCode = `javascript:(function(){var d=document,s=d.createElement("script");s.src="https://segament.vercel.app/scripts/segamentImporter.js?t="+Date.now();d.body.appendChild(s);})();`;