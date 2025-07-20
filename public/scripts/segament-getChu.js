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
            
            const ratingElement = doc.querySelector('.rating_block .rating_value');
            if (ratingElement) playerInfo.rating = parseFloat(ratingElement.innerText);
            
            const overPowerElement = doc.querySelector('.rating_block .user_data_ol_op_value');
            if (overPowerElement) playerInfo.overPower = parseFloat(overPowerElement.innerText);

            return playerInfo;
        };

        const collectAllMusicPlays = async (token) => {
            let page = 1;
            const plays = [];
            while (true) {
                const pageDoc = await utils.fetchPageDoc(`${baseUrl}record/musicGenre/send?token=${token}&page=${page}`);
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
                            title: title,
                            difficulty: difficulty, 
                            score: score,
                            isFullCombo: lampSrc.includes('fullcombo'),
                            isAllJustice: lampSrc.includes('alljustice'),
                         });
                    });
                });
                page++;
                if (page > 30) {
                     console.warn('[Segament] 페이지 제한(30)에 도달하여 수집을 중단합니다.');
                     break;
                }
            }
            return plays;
        };

        // --- 데이터 수집 실행 ---
        const playerDataDoc = await utils.fetchPageDoc(baseUrl + 'home/playerData/');
        
        // [수정] playerData 페이지 내의 'Record' 탭 링크에서 토큰을 찾습니다.
        const recordLinkElement = playerDataDoc.querySelector('a[href*="record/musicGenre/"]');
        if (!recordLinkElement) throw new Error("토큰을 찾을 수 없습니다. CHUNITHM-NET의 HTML 구조가 변경되었을 수 있습니다.");
        
        const token = new URLSearchParams(recordLinkElement.href.split('?')[1]).get('token');
        if (!token) throw new Error("링크에서 토큰을 추출하는 데 실패했습니다.");

        const profileData = collectPlayerData(playerDataDoc);
        const playlogsData = await collectAllMusicPlays(token);
        
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
        segamentImportWindow.postMessage({ type: 'SEGAMENT_ERROR', payload: { message: error.message } }, segamentOrigin);
      }
    }
    
    window.removeEventListener('message', handleRequestMessage);
  };

  console.log('[Segament] 북마크릿이 실행되었습니다.');
  segamentImportWindow = window.open(`${segamentOrigin}/import`, '_blank');
  window.addEventListener('message', handleRequestMessage);

})();