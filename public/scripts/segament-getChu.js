// 파일 경로: public/scripts/segament-getChu.js
(async function() {
  let segamentImportWindow = null;
  const segamentOrigin = 'https://segament.vercel.app';

  const handleRequestMessage = async (event) => {
    if (event.origin !== segamentOrigin || event.data !== 'REQUEST_SEGAMENT_DATA') return;
    
    window.removeEventListener('message', handleRequestMessage);

    const postMessageToImporter = (type, payload) => {
        if (segamentImportWindow) segamentImportWindow.postMessage({ type, payload }, segamentOrigin);
    };

    try {
        const isInternational = location.hostname.includes('-eng');
        const region = isInternational ? 'INTL' : 'JP';
        const baseUrl = isInternational ? 'https://chunithm-net-eng.com/mobile/' : 'https://new.chunithm-net.com/chuni-mobile/html/mobile/';
        const utils = {
            fetchPostPageDoc: async (url, token) => {
                const formData = new FormData();
                formData.append('genre', '99');
                formData.append('token', token);
                const res = await fetch(url, { method: 'POST', body: new URLSearchParams(formData) });
                if (res.ok) return new DOMParser().parseFromString(await res.text(), 'text/html');
                throw new Error(`Failed to POST fetch ${url}: ${res.status}`);
            },
            fetchPageDoc: async (url) => {
                const res = await fetch(url);
                if (res.ok) return new DOMParser().parseFromString(await res.text(), 'text/html');
                throw new Error(`Failed to GET fetch ${url}: ${res.status}`);
            },
            normalize: (str) => str ? str.normalize('NFKC').trim() : '',
        };

        const collectPlayerData = (playerDataDoc, customiseDoc) => {
            const playerInfo = {};
            // --- 기존 데이터 수집 ---
            playerInfo.playerName = utils.normalize(playerDataDoc.querySelector('.player_name_in')?.innerText);
            const ratingImages = playerDataDoc.querySelectorAll('.player_rating_num_block img');
            let ratingStr = '';
            ratingImages.forEach(img => {
                if (img.src.includes('comma')) ratingStr += '.';
                else {
                    const match = img.src.match(/_(\d\d?)\.png/);
                    if (match) ratingStr += match[1].slice(-1);
                }
            });
            playerInfo.rating = parseFloat(ratingStr) || 0;
            const opText = utils.normalize(playerDataDoc.querySelector('.player_overpower_text')?.innerText);
            if (opText) playerInfo.overPower = parseFloat(opText.split(' ')[0]);
            const rebornLv = parseInt(playerDataDoc.querySelector('.player_reborn')?.innerText || '0');
            const mainLv = parseInt(playerDataDoc.querySelector('.player_lv')?.innerText || '0');
            playerInfo.level = (rebornLv * 100) + mainLv;
            const honors = [];
            playerDataDoc.querySelectorAll('.player_honor_short').forEach(honor => {
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
            playerInfo.teamName = utils.normalize(playerDataDoc.querySelector('.player_team_name')?.innerText);
            playerInfo.lastPlayDate = utils.normalize(playerDataDoc.querySelector('.player_lastplaydate_text')?.innerText);
            playerInfo.friendCode = utils.normalize(playerDataDoc.querySelector('.user_data_friend_tap span[style*="display:none"]')?.innerText);
            const playCountElement = playerDataDoc.querySelector('.user_data_play_count .user_data_text');
            const playCountText = playCountElement ? utils.normalize(playCountElement.innerText) : '0';
            playerInfo.playCount = parseInt(playCountText.replace(/,/g, '')) || 0;
            playerInfo.battleRankImg = playerDataDoc.querySelector('.player_battlerank img')?.src;

            // --- 레이팅 히스토리를 위한 타임스탬프 생성 ---
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            playerInfo.ratingTimestamp = `${year}-${month}-${day}|${hour}:${minute}`;

            // --- 신규 데이터 수집 ---
            const teamEmblem = playerDataDoc.querySelector('.player_data_right > div[class*="player_team_emblem_"]');
            if (teamEmblem) {
                const classMatch = teamEmblem.className.match(/player_team_emblem_(\w+)/);
                if (classMatch) playerInfo.teamEmblemColor = classMatch[1];
            }
            playerInfo.classEmblemTop = playerDataDoc.querySelector('.player_classemblem_top img')?.src;
            playerInfo.classEmblemBase = playerDataDoc.querySelector('.player_classemblem_base img')?.src;
            const charaContainer = playerDataDoc.querySelector('div.player_chara');
            if (charaContainer) {
                playerInfo.characterImage = charaContainer.querySelector('img')?.src;
                const style = charaContainer.getAttribute('style');
                if (style) {
                    const bgMatch = style.match(/url\((.*?)\)/);
                    if (bgMatch) playerInfo.characterBackground = bgMatch[1].replace(/"/g, ""); // 따옴표 제거
                }
            }
            playerInfo.nameplateImage = customiseDoc.querySelector('div.nameplate_now img')?.src;
            
            return playerInfo;
        };
        
        const collectRatingList = async (url) => {
            const doc = await utils.fetchPageDoc(url);
            const musicForms = doc.querySelectorAll('.w388.musiclist_box');
            const ratingList = [];
            const diffMap = { '0': 'BASIC', '1': 'ADVANCED', '2': 'EXPERT', '3': 'MASTER', '4': 'ULTIMA' };
            musicForms.forEach(form => {
                const title = utils.normalize(form.querySelector('.music_title')?.innerText);
                const scoreText = utils.normalize(form.querySelector('.play_musicdata_highscore .text_b')?.innerText);
                const id = form.querySelector('input[name="idx"]')?.value;
                const diffValue = form.querySelector('input[name="diff"]')?.value;
                if (!title || !scoreText || !id || diffValue === undefined) return;
                const score = parseInt(scoreText.replace(/,/g, ''));
                const difficulty = diffMap[diffValue] || 'UNKNOWN';
                ratingList.push({ id, title, score, difficulty });
            });
            return ratingList;
        };
        
        const collectAllMusicPlays = async (token) => {
            const plays = [];
            const PlayRank = {0:'D',1:'C',2:'B',3:'BB',4:'BBB',5:'A',6:'AA',7:'AAA',8:'S',9:'S+',10:'SS',11:'SS+',12:'SSS',13:'SSS+'};
            const difficultiesToFetch = ['basic', 'advanced', 'expert', 'master', 'ultima'];
            for (let i = 0; i < difficultiesToFetch.length; i++) {
                 const difficulty = difficultiesToFetch[i];
                 postMessageToImporter('SEGAMENT_PROGRESS', { message: `${difficulty.toUpperCase()} 악곡 기록 수집 중...`, value: 20 + (i * 15) });
                 const url = `${baseUrl}record/musicGenre/send${difficulty}`;
                 const pageDoc = await utils.fetchPostPageDoc(url, token);
                 const musicBlocks = pageDoc.querySelectorAll('.w388.musiclist_box');
                 
                 musicBlocks.forEach(block => {
                    const title = utils.normalize(block.querySelector('.music_title')?.innerText);
                    const scoreText = utils.normalize(block.querySelector('.play_musicdata_highscore span.text_b')?.innerText);
                    const id = block.querySelector('input[name="idx"]')?.value;
                    if (!title || !scoreText || !id) return;
                    const score = parseInt(scoreText.replace(/,/g, ''));
                    const lamps = block.querySelectorAll('.play_musicdata_icon img');
                    let rank = 'D', clearType = 0, comboType = 0, fullChainType = 0;
                    lamps.forEach(lamp => {
                        const src = lamp.src;
                        if(src.includes('icon_clear.png')) clearType = 1; else if(src.includes('icon_hard.png')) clearType = 2; else if(src.includes('icon_brave.png')) clearType = 3; else if(src.includes('icon_absolute.png')) clearType = 4; else if(src.includes('icon_catastrophy.png')) clearType = 5;
                        if(src.includes('icon_fullcombo.png')) comboType = 1; else if(src.includes('icon_alljustice.png')) comboType = 2; else if(src.includes('icon_alljusticecritical.png')) comboType = 3;
                        if(src.includes('icon_fullchain2.png')) fullChainType = 2; else if(src.includes('icon_fullchain.png')) fullChainType = 1;
                        const match = src.match(/icon_rank_(\d+)\.png/);
                        if (match) rank = PlayRank[parseInt(match[1])] || 'D';
                    });
                    plays.push({ id, title, difficulty: difficulty.toUpperCase(), score, rank, clearType, comboType, fullChainType });
                 });
            }
            return plays;
        };

        postMessageToImporter('SEGAMENT_PROGRESS', { message: '토큰 정보 확인 중...', value: 5 });
        const tokenInput = (await utils.fetchPageDoc(baseUrl + 'record/musicGenre/')).querySelector('form input[name="token"]');
        if (!tokenInput || !tokenInput.value) throw new Error("토큰을 찾을 수 없습니다.");
        const token = tokenInput.value;

        postMessageToImporter('SEGAMENT_PROGRESS', { message: '프로필 및 커스터마이즈 정보 수집 중...', value: 10 });
        const [playerDataDoc, customiseDoc] = await Promise.all([
            utils.fetchPageDoc(baseUrl + 'home/playerData/'),
            utils.fetchPageDoc(baseUrl + 'collection/customise/')
        ]);
        const profileData = collectPlayerData(playerDataDoc, customiseDoc);
        
        const [playlogsData, bestRatingList, newRatingList] = await Promise.all([
            collectAllMusicPlays(token),
            collectRatingList(baseUrl + 'home/playerData/ratingDetailBest/'),
            collectRatingList(baseUrl + 'home/playerData/ratingDetailRecent/')
        ]);
        
        const payload = {
            gameType: 'CHUNITHM',
            region,
            profile: profileData,
            gameData: {
                playlogs: playlogsData,
                ratingLists: {
                    best: bestRatingList,
                    new: newRatingList
                }
            }
        };

        console.log('[Segament] 최종 추출 데이터:', payload);
        postMessageToImporter('SEGAMENT_PROGRESS', { message: '데이터 추출 완료. 서버로 전송합니다.', value: 100 });
        postMessageToImporter('SEGAMENT_DATA_PAYLOAD', payload);

    } catch (error) {
        console.error('[Segament] 데이터 추출 중 오류:', error);
        postMessageToImporter('SEGAMENT_ERROR', { message: error.message });
    }
  };

  console.log('[Segament] 북마크릿이 실행되었습니다.');
  segamentImportWindow = window.open(`${segamentOrigin}/import`, '_blank');
  window.addEventListener('message', handleRequestMessage);
})();