// 파일 경로: public/scripts/segament-getChu.js

(async function() {
  let segamentImportWindow = null;
  const segamentOrigin = 'https://segament.vercel.app';

  const handleRequestMessage = async (event) => {
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
            normalize: (str) => str.normalize('NFKC').trim(),
        };

        const collectPlayerData = (doc) => {
            const playerInfoRows = doc.querySelectorAll('.player-info-table .css-124qg6c-player-info-table tr');
            const playerInfo = {};
            playerInfoRows.forEach(row => {
                const key = utils.normalize(row.querySelector('th').innerText);
                const value = utils.normalize(row.querySelector('td').innerText);
                playerInfo[key] = value;
            });
            // 추가적인 데이터 파싱 (예: 레이팅, OP)
            const ratingElement = doc.querySelector('.rating_block .rating_value');
            if (ratingElement) playerInfo.rating = parseFloat(ratingElement.innerText);
            
            const overPowerElement = doc.querySelector('.rating_block .user_data_ol_op_value');
            if (overPowerElement) playerInfo.overPower = parseFloat(overPowerElement.innerText);

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
                    const title = utils.normalize(block.querySelector('.music_title').innerText);
                    const difficulties = block.querySelectorAll('.play_musicdata_icon');
                    const scores = block.querySelectorAll('.play_musicdata_score_text');
                    const lamps = block.querySelectorAll('.play_musicdata_lump');

                    difficulties.forEach((diff, i) => {
                        const difficulty = diff.src.split('/').pop().split('.')[0].replace('icon_text_', '').toUpperCase();
                        const score = parseInt(scores[i].innerText.replace(/,/g, ''));
                        const lampSrc = lamps[i] ? lamps[i].src : '';
                        
                        plays.push({ 
                            title: title, // 나중에 musicId로 변환 필요
                            difficulty: difficulty, 
                            score: score,
                            isFullCombo: lampSrc.includes('fullcombo'),
                            isAllJustice: lampSrc.includes('alljustice'),
                         });
                    });
                });
                page++;
                // 개발 중 무한 루프 방지를 위해 임시로 페이지 제한
                if (page > 30) {
                     console.warn('[Segament] 페이지 제한(30)에 도달하여 수집을 중단합니다.');
                     break;
                }
            }
            return plays;
        };
        // --- 데이터 수집 실행 ---
        const homeDoc = await utils.fetchPageDoc(baseUrl + 'home/');
        const tokenElement = homeDoc.querySelector('.resend_form a');
        if (!tokenElement) throw new Error("토큰을 찾을 수 없습니다. CHUNITHM-NET에 로그인되어 있는지 확인해주세요.");

        const token = new URLSearchParams(tokenElement.href.split('?')[1]).get('token');
        
        const playerDataDoc = await utils.fetchPageDoc(baseUrl + 'home/playerData/');
        const profileData = collectPlayerData(playerDataDoc);
        
        const musicRecordDoc = await utils.fetchPageDoc(baseUrl + 'record/musicGenre/');
        const playlogsData = await collectAllMusicPlays(musicRecordDoc, token);
        // ==========================================================
        // ===== 기존 segament-getChu.js 데이터 추출 로직 끝 =====
        // ==========================================================
        
        const payload = {
            gameType: 'CHUNITHM',
            region: region,
            profile: profileData,
            playlogs: playlogsData,
        };

        console.log('[Segament] 데이터 추출 완료. 수신 창으로 전송합니다.', payload);
        
        segamentImportWindow.postMessage({ type: 'SEGAMENT_DATA_PAYLOAD', payload: payload }, segamentOrigin);

      } catch (error) {
        console.error('[Segament] 데이터 추출 중 오류:', error);
        segamentImportWindow.postMessage({ type: 'SEGAMENT_ERROR', payload: error.message }, segamentOrigin);
      }
    }
    
    window.removeEventListener('message', handleRequestMessage);
  };

  // --- 스크립트 실행 시작점 ---
  console.log('[Segament] 북마크릿이 실행되었습니다.');
  
  segamentImportWindow = window.open(`${segamentOrigin}/import`, '_blank');
  
  window.addEventListener('message', handleRequestMessage);

})();