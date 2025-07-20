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
            fetchPageDoc: async (url) => {
                const res = await fetch(url);
                if (res.ok) {
                    const html = await res.text();
                    return new DOMParser().parseFromString(html, 'text/html');
                }
                throw new Error(`Failed to fetch ${url}: ${res.status}`);
            },
            normalize: (str) => str.normalize('NFKC').trim(),
        };

        const collectPlayerData = (doc) => {
            const playerInfo = {};
            const playerInfoRows = doc.querySelectorAll('.box_player_info tr');
            playerInfoRows.forEach(row => {
                const keyElement = row.querySelector('th');
                const valueElement = row.querySelector('td');
                if (keyElement && valueElement) {
                   const key = utils.normalize(keyElement.innerText);
                   const value = utils.normalize(valueElement.innerText);
                   if (key.includes('PLAYER NAME')) playerInfo.playerName = value;
                   if (key.includes('RATING')) playerInfo.rating = parseFloat(value);
                   if (key.includes('OVER POWER')) playerInfo.overPower = parseFloat(value);
                   if (key.includes('TOTAL PLAYS')) playerInfo.playCount = parseInt(value.replace(/,/g, ''));
                }
            });
            playerInfo.title = utils.normalize(doc.querySelector('.player_name_in .trophy_inner_box a')?.innerText || '');
            return playerInfo;
        };

        const collectAllMusicPlays = async (token) => {
            let page = 1;
            const plays = [];
            while (true) {
                // musicGenre 페이지는 POST 요청이 필요할 수 있으므로, GET으로 먼저 시도
                const url = `${baseUrl}record/musicGenre/send?token=${token}&page=${page}`;
                const pageDoc = await utils.fetchPageDoc(url);
                const musicBlocks = pageDoc.querySelectorAll('.w428.musiclist_box.pointer');
                if (musicBlocks.length === 0) break;

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
                if (page > 50) {
                     console.warn('[Segament] 페이지 제한(50)에 도달하여 수집을 중단합니다.');
                     break;
                }
            }
            return plays;
        };

        // --- 데이터 수집 실행 ---
        // [수정] musicGenre 페이지로 먼저 가서 숨겨진 폼에서 토큰을 찾습니다.
        const musicRecordDoc = await utils.fetchPageDoc(baseUrl + 'record/musicGenre/');
        const tokenInput = musicRecordDoc.querySelector('input[name="token"]');
        if (!tokenInput || !tokenInput.value) {
            throw new Error("토큰을 찾을 수 없습니다. CHUNITHM-NET에 로그인되어 있는지, 또는 HTML 구조가 변경되었는지 확인해주세요.");
        }
        const token = tokenInput.value;

        const playerDataDoc = await utils.fetchPageDoc(baseUrl + 'home/playerData/');
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