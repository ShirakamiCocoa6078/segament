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

        // 필요한 유틸리티 함수들을 스크립트 내부에 직접 정의합니다.
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
            fetchPostPageDoc: async (url, token) => {
                const formData = new FormData();
                formData.append('genre', '99');
                formData.append('token', token);

                const res = await fetch(url, { method: 'POST', body: new URLSearchParams(formData) });
                if (res.ok) {
                    const html = await res.text();
                    return new DOMParser().parseFromString(html, 'text/html');
                }
                throw new Error(`Failed to fetch ${url}: ${res.status}`);
            },
        };

        const collectPlayerData = (doc) => {
            const playerInfo = {};
            playerInfo.playerName = utils.normalize(doc.querySelector('.player_name_in')?.innerText);

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

            const opText = utils.normalize(doc.querySelector('.player_overpower_text')?.innerText);
            if (opText) playerInfo.overPower = parseFloat(opText.split(' ')[0]);
            
            const playCountElement = doc.querySelector('.user_data_play_count .user_data_text');
            const playCountText = playCountElement ? utils.normalize(playCountElement.innerText) : '0';
            playerInfo.playCount = parseInt(playCountText.replace(/,/g, '')) || 0;

            return playerInfo;
        };

        const collectAllMusicPlays = async (token) => {
            const plays = [];
            const difficultiesToFetch = ['basic', 'advanced', 'expert', 'master', 'ultima'];
            for (const difficulty of difficultiesToFetch) {
                 const url = `${baseUrl}record/musicGenre/send${difficulty}.html`;
                 const pageDoc = await utils.fetchPostPageDoc(url, token);
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

        const musicRecordDoc = await utils.fetchPageDoc(baseUrl + 'record/musicGenre/');
        const tokenInput = musicRecordDoc.querySelector('.box02.w420 form input[name="token"]');
        if (!tokenInput || !tokenInput.value) {
            throw new Error("토큰을 찾을 수 없습니다.");
        }
        const token = tokenInput.value;

        const playerDataDoc = await utils.fetchPageDoc(baseUrl + 'home/playerData/');
        const profileData = collectPlayerData(playerDataDoc);
        const playlogsData = await collectAllMusicPlays(token);
        
        const payload = {
            gameType: 'CHUNITHM',
            region: region,
            profile: profileData,
            playlogs: