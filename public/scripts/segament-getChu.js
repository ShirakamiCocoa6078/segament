// 파일 경로: public/scripts/segament-getChu.js

(async function() {
  let segamentImportWindow = null;
  const segamentOrigin = 'https://segament.vercel.app';

  // 1. 데이터 수신 창으로부터 데이터 요청을 받으면, 데이터를 추출하여 전송합니다.
  const handleRequestMessage = async (event) => {
    // 보안: Segament 사이트로부터 온 요청인지, 데이터 요청 메시지가 맞는지 확인
    if (event.origin !== segamentOrigin || event.data !== 'REQUEST_SEGAMENT_DATA') {
      return;
    }
    
    console.log('[Segament] 데이터 요청을 수신했습니다. 추출을 시작합니다.');

    if (segamentImportWindow) {
      try {
        // ==========================================================
        // ===== 기존 segament-getChu.js 데이터 추출 로직 시작 =====
        // ==========================================================
        const isInternational = location.hostname === 'chunithm-net-eng.com';
        const region = isInternational ? 'INTL' : 'JP';
        const baseUrl = isInternational ?
            'https://chunithm-net-eng.com/mobile/' :
            'https://new.chunithm-net.com/chuni-mobile/html/mobile/';

        const utils = {
            fetchPage: async (url) => {
                const res = await fetch(url);
                if (res.ok)
                    return await res.text();
                throw new Error('Failed to fetch: ' + res.status);
            },
            fetchPageDoc: async (url) => {
                const html = await utils.fetchPage(url);
                return new DOMParser().parseFromString(html, 'text/html');
            },
            normalize: (str) => str.normalize('NFKC'),
        };

        const collectPlayerData = (doc) => {
            const-player-info-table.css-124qg6c-player-info-table tr');
            const playerInfo = {};
            playerInfoRows.forEach(row => {
                const key = utils.normalize(row.querySelector('th').innerText);
                const value = utils.normalize(row.querySelector('td').innerText);
                playerInfo[key] = value;
            });
            return playerInfo;
        };

        const collectAllMusicPlays = async (doc, token) => {
            let page = 1;
            const plays = [];
            while (true) {
                const pageDoc = await utils.fetchPageDoc(`${baseUrl}record/musicGenre/send${token}&page=${page}`);
                const musicBlocks = pageDoc.querySelectorAll('.w428.musiclist_box.pointer');
                if (musicBlocks.length === 0)
                    break;
                musicBlocks.forEach(block => {
                    const musicInfo = {};
                    musicInfo.title = utils.normalize(block.querySelector('.music_title').innerText);
                    const difficulties = block.querySelectorAll('.play_musicdata_icon');
                    const scores = block.querySelectorAll('.play_musicdata_score_text');
                    difficulties.forEach((diff, i) => {
                        const difficulty = diff.src.split('/').pop().split('.')[0].replace('icon_text_', '');
                        const score = parseInt(scores[i].innerText.replace(/,/g, ''));
                        plays.push({ title: musicInfo.title, difficulty, score });
                    });
                });
                page++;
            }
            return plays;
        };
        
        // ... (이하 제공해주신 파일의 나머지 모든 데이터 수집 함수들)
        // collectCourses, collectHonors, collectCharacters, collectCustomizes, collectWorldsEndPlays ...

        // --- 데이터 수집 실행 ---
        const homeDoc = await utils.fetchPageDoc(baseUrl + 'home/ Aime.html');
        const token = new URLSearchParams(homeDoc.querySelector('.resend_form a').href.split('?')[1]).get('token');
        
        const profileData = collectPlayerData(homeDoc);
        const playlogsData = await collectAllMusicPlays(homeDoc, token);
        // const coursesData = await collectCourses(homeDoc, token);
        // ... 등등
        // ==========================================================
        // ===== 기존 segament-getChu.js 데이터 추출 로직 끝 =====
        // ==========================================================
        
        const payload = {
            gameType: 'CHUNITHM',
            region: region,
            profile: profileData,
            playlogs: playlogsData,
            // courses: coursesData,
            // ... 등등
        };

        console.log('[Segament] 데이터 추출 완료. 수신 창으로 전송합니다.', payload);
        
        // 2. 추출된 데이터를 `import` 창으로 전송합니다.
        segamentImportWindow.postMessage({ type: 'SEGAMENT_DATA_PAYLOAD', payload: payload }, segamentOrigin);

      } catch (error) {
        console.error('[Segament] 데이터 추출 중 오류:', error);
        segamentImportWindow.postMessage({ type: 'SEGAMENT_ERROR', payload: error.message }, segamentOrigin);
      }
    }
    
    // 이 리스너는 한 번만 사용되므로 제거합니다.
    window.removeEventListener('message', handleRequestMessage);
  };

  // --- 스크립트 실행 시작점 ---
  console.log('[Segament] 북마크릿이 실행되었습니다.');
  
  // 3. `/import` 페이지를 새 탭으로 엽니다.
  segamentImportWindow = window.open(`${segamentOrigin}/import`, '_blank');
  
  // 4. `import` 페이지로부터 데이터 요청을 받을 준비를 합니다.
  window.addEventListener('message', handleRequestMessage);

})();