// 파일 경로: public/scripts/segamentImporter.js

(function() {
  const SCRIPT_BASE_URL = 'https://segament.vercel.app/scripts/';
  const host = window.location.hostname;
  let scriptToLoad = '';

  if (host.includes('chunithm-net')) {
    scriptToLoad = 'segament-getChu.js';
  } else if (host.includes('maimaidx')) {
    scriptToLoad = 'segament-getMai.js';
  } else if (host.includes('ongeki-net')) {
    scriptToLoad = 'segament-getGeki.js';
  }

  if (scriptToLoad) {
    const script = document.createElement('script');
    script.src = SCRIPT_BASE_URL + scriptToLoad + '?t=' + new Date().getTime(); // 캐시 방지
    document.body.appendChild(script);
  } else {
    alert('Segament: 지원하지 않는 사이트입니다.');
  }
})();
