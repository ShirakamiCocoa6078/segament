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
        const isInternational = location.hostname.includes('-eng');
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
            normalize: (str) => str ? str.normalize('NFKC').trim() : '',
        };

        const collectPlayerData = (doc) => {
            const playerInfo = {};
            
            // a. 플레이어 이름
            playerInfo.playerName = utils.normalize(doc.querySelector('.player_name_in')?.innerText);

            // b. 레이팅 (이미지 파싱)
            const ratingImages = doc.querySelectorAll('.player_rating_num_block img');
            let ratingStr = '';
            ratingImages.forEach(img => {
                if (img.src.includes('comma')) {
                    ratingStr += '.';
                } else {
                    const match = img.src.match(/_(\d\d?)\.png/);
                    if (match) ratingStr += match[1].slice(-1);
                }
            });
            playerInfo.rating = parseFloat(ratingStr) || 0;

            // c. OVER POWER
            const opText = utils.normalize(doc.querySelector('.player_overpower_text')?.innerText);
            if (opText) {
                playerInfo.overPower = parseFloat(opText.split(' ')[0]);
            }

            // d. 플레이어 레벨
            const rebornLv = parseInt(doc.querySelector('.player_reborn')?.innerText || '0');
            const mainLv = parseInt(doc.querySelector('.player_lv')?.innerText || '0');
            playerInfo.level = (rebornLv * 100) + mainLv;

            // e. 플레이어 칭호
            const honors = [];
            doc.querySelectorAll('.player_honor_short').forEach(honor => {
                const text = utils.normalize(honor.querySelector('.player_honor_text span')?.innerText);
                const style = honor.getAttribute('style');
                let color = 'NORMAL';
                if (style) {
                    const match = style.match(/honor_bg_(\w+)\.png/);
                    if (match) color = match[1].toUpperCase();
                }
                honors.push({ text, color });
            });
            playerInfo.honors = honors;

            // f. 소속 팀
            playerInfo.teamName = utils.normalize(doc.querySelector('.player_team_name')?.innerText);

            // g. 최종 플레이
            playerInfo.lastPlayDate = utils.normalize(doc.querySelector('.player_lastplaydate_text')?.innerText);
            
            // h. 배틀 랭크
            const battleRankImg = doc.querySelector('.player_battlerank img')?.src;
            if (battleRankImg) playerInfo.battleRankImg = battleRankImg;
            
            // i. 프렌드코드
            playerInfo.friendCode = utils.normalize(doc.querySelector('.user_data_friend_tap span[style*="display:none"]')?.innerText);

            // j. 총 플레이 횟수
            const playCountText = utils.normalize(doc.querySelector('.user_data_text')?.innerText);
            if(playCountText) playerInfo.playCount = parseInt(playCountText.replace(/,/g, ''));

            return playerInfo;
        };

        const collectAllMusicPlays = async (token) => {
            const plays = [];
            // 모든 난이도를 순회하며 데이터 수집
            const difficultiesToFetch = ['basic', 'advanced', 'expert', 'master', 'ultima'];
            for (const difficulty of difficultiesToFetch) {
                 const url = `${baseUrl}record/musicGenre/${difficulty}/send?token=${token}`;
                 const pageDoc = await utils.fetchPageDoc(url);
                 const musicBlocks = pageDoc.querySelectorAll('.w388.musiclist_box');
                 
                 musicBlocks.forEach(block => {
                    const title = utils.normalize(block.querySelector('.music_title')?.innerText);
                    const scoreText = utils.normalize(block.querySelector('.play_musicdata_highscore span.text_b')?.innerText);
                    if (!title || !scoreText) return;

                    const score = parseInt(scoreText.replace(/,/g, ''));
                    const lamps = block.querySelectorAll('.play_musicdata_icon img');
                    let isFullCombo = false;
                    let isAllJustice = false;

                    lamps.forEach(lamp => {
                        if (lamp.src.includes('fullcombo')) isFullCombo = true;
                        if (lamp.src.includes('alljustice')) isAllJustice = true;
                    });
                    
                    plays.push({ 
                        title: title, 
                        difficulty: difficulty.toUpperCase(), 
                        score: score,
                        isFullCombo: isFullCombo,
                        isAllJustice: isAllJustice,
                     });
                 });
            }
            return plays;
        };

        // --- 데이터 수집 실행 ---
        const musicRecordDoc = await utils.fetchPageDoc(baseUrl + 'record/musicGenre/');
        const tokenInput = musicRecordDoc.querySelector('.box02.w420 form input[name="token"]');
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