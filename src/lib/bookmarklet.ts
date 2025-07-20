// 파일 경로: src/lib/bookmarklet.ts

export const bookmarkletLoaderCode = `javascript:(function(){var d=document,s=d.createElement('script');s.src='https://segament.vercel.app/scripts/segamentImporter.js?t='+new Date().getTime();d.body.appendChild(s);})();`;