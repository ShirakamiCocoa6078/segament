// 파일 경로: public/scripts/segament-getChu.js (전체 수집용)

(async function() {
  let segamentImportWindow = null;
  const segamentOrigin = 'https://segament.vercel.app';

  const handleRequestMessage = async (event) => {
    if (event.origin !== segamentOrigin || event.data !== 'REQUEST_SEGAMENT_DATA') {
      return;
    }

    console.log('[Segament] 디버깅 모드: 전체 HTML 수집을 시작합니다.');
    
    const postDebugMessage = (message) => {
        if(segamentImportWindow) {
            segamentImportWindow.postMessage({ type: 'SEGAMENT_DEBUG', payload: message }, segamentOrigin);
        }
    };

    try {
        const isInternational = location.hostname === 'chunithm-net-eng.com';
        const baseUrl = isInternational ?
            'https://chunithm-net-eng.com/mobile/' :
            'https://new.chunithm-net.com/chuni-mobile/html/mobile/';
        
        // 수집할 페이지 경로 목록
        const pathsToFetch = [
            'home/',
            'home/playerData/', // 토큰 및 프로필 정보가 있을 가능성이 높은 페이지
            'record/playlog/',
            'record/musicGenre/basic/',
            'record/musicGenre/advanced/',
            'record/musicGenre/expert/',
            'record/musicGenre/master/',
            'record/musicGenre/ultima/',
            'record/worldsEndList/',
            'record/courseList/',
            'collection/',
            'collection/characterList/',
            'collection/customise/'
        ];

        const utils = {
            fetchPage: async (url) => {
                const res = await fetch(url);
                if (res.ok) return await res.text();
                // 404 등의 에러는 무시하고 null 반환
                console.warn(`[Segament] Fetch failed for ${url}: ${res.status}`);
                return null;
            },
        };
        
        const allHtmlData = {};

        postDebugMessage('전체 페이지 HTML 수집을 시작합니다...');

        for (const path of pathsToFetch) {
            const url = baseUrl + path;
            console.log(`[Segament] Fetching: ${url}`);
            postDebugMessage(`- ${path} 수집 중...`);
            
            const html = await utils.fetchPage(url);
            // URL의 마지막 부분을 키로 사용하여 저장
            const key = path.replace(/\/$/, '').split('/').pop();
            allHtmlData[key] = html;
        }

        const outputJson = JSON.stringify(allHtmlData, null, 2);
        
        console.log('========== CHUNITHM-NET 전체 HTML 데이터 (JSON) ==========');
        console.log(outputJson);
        console.log('=======================================================');
        
        postDebugMessage('성공! 위 JSON을 복사하여 분석을 요청해주세요.');
        alert('[Segament 디버깅] 모든 페이지의 HTML을 JSON 형식으로 콘솔에 출력했습니다. 개발자 도구(F12)를 열어 전체 내용을 복사해주세요.');


    } catch (error) {
        console.error('[Segament] 디버깅 중 오류:', error);
        postDebugMessage(`오류 발생: ${error.message}`);
    }
    
    window.removeEventListener('message', handleRequestMessage);
  };

  console.log('[Segament] 전체 수집용 디버깅 북마크릿이 실행되었습니다.');
  segamentImportWindow = window.open(`${segamentOrigin}/import`, '_blank');
  window.addEventListener('message', handleRequestMessage);

})();