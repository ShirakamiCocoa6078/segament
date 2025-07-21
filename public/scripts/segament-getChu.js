// 파일 경로: public/scripts/segament-getChu.js

(async function() {
  let segamentImportWindow = null;
  const segamentOrigin = 'https://segament.vercel.app';

  const handleRequestMessage = async (event) => {
    if (event.origin !== segamentOrigin || event.data !== 'REQUEST_SEGAMENT_DATA') return;
    
    console.log('[Segament] 데이터 요청을 수신했습니다. 추출 및 분할 전송을 시작합니다.');

    const postMessageToImporter = (type, payload) => {
        if (segamentImportWindow) {
            segamentImportWindow.postMessage({ type, payload }, segamentOrigin);
        }
    };

    try {
        const isInternational = location.hostname.includes('-eng');
        const region = isInternational ? 'INTL' : 'JP';
        const baseUrl = isInternational ?
            'https://chunithm-net-eng.com/mobile/' :
            'https://new.chunithm-net.com/chuni-mobile/html/mobile/';

        const utils = { /* ... 이전과 동일한 utils 함수 ... */ };
        const collectPlayerData = (doc) => { /* ... 이전과 동일한 profile 추출 함수 ... */ };
        const collectAllMusicPlays = async (token) => { /* ... 이전과 동일한 playlogs 추출 함수 ... */ };

        const musicRecordDoc = await utils.fetchPageDoc(baseUrl + 'record/musicGenre/');
        const tokenInput = musicRecordDoc.querySelector('.box02.w420 form input[name="token"]');
        if (!tokenInput || !tokenInput.value) throw new Error("토큰을 찾을 수 없습니다.");
        const token = tokenInput.value;

        const playerDataDoc = await utils.fetchPageDoc(baseUrl + 'home/playerData/');
        const profileData = collectPlayerData(playerDataDoc);
        const playlogsData = await collectAllMusicPlays(token);
        
        console.log(`[Segament] 데이터 추출 완료. Profile: 1건, Playlogs: ${playlogsData.length}건`);
        postMessageToImporter('SEGAMENT_PROGRESS', { message: `데이터 추출 완료. 총 ${playlogsData.length}곡` });
        
        // --- 청크 분할 전송 로직 ---
        const CHUNK_SIZE = 100;
        
        // 1. 첫 번째 요청: 프로필 데이터만 전송
        console.log('[Segament] 1단계: 프로필 데이터 전송 중...');
        postMessageToImporter('SEGAMENT_PROGRESS', { message: '프로필 정보 저장 중...' });
        const profilePayload = {
            gameType: 'CHUNITHM',
            region,
            profile: profileData,
        };
        const profileResponse = await fetch(`${segamentOrigin}/api/v1/import/chunithm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profilePayload),
        });

        if (!profileResponse.ok) throw new Error('프로필 데이터 전송에 실패했습니다.');
        const { profileId } = await profileResponse.json();
        if (!profileId) throw new Error('서버로부터 프로필 ID를 받지 못했습니다.');
        console.log(`[Segament] 프로필 저장 완료 (ID: ${profileId}). 플레이로그 전송을 시작합니다.`);

        // 2. 두 번째부터: 플레이로그를 100개씩 나누어 전송
        for (let i = 0; i < playlogsData.length; i += CHUNK_SIZE) {
            const chunk = playlogsData.slice(i, i + CHUNK_SIZE);
            const message = `플레이로그 저장 중... (${i + chunk.length}/${playlogsData.length})`;
            console.log(`[Segament] ${message}`);
            postMessageToImporter('SEGAMENT_PROGRESS', { message });

            const playlogPayload = {
                profileId,
                playlogsChunk: chunk,
            };
            
            const playlogResponse = await fetch(`${segamentOrigin}/api/v1/import/chunithm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playlogPayload),
            });
            if (!playlogResponse.ok) throw new Error(`플레이로그 청크 #${Math.floor(i / CHUNK_SIZE) + 1} 전송에 실패했습니다.`);
        }
        
        console.log('[Segament] 모든 데이터 전송 완료.');
        postMessageToImporter('SEGAMENT_SUCCESS', { message: "모든 데이터 전송 완료!" });

      } catch (error) {
        console.error('[Segament] 데이터 추출 또는 전송 중 오류:', error);
        postMessageToImporter('SEGAMENT_ERROR', { message: error.message });
      }
    }
    window.removeEventListener('message', handleRequestMessage);
  };

  console.log('[Segament] 북마크릿이 실행되었습니다.');
  segamentImportWindow = window.open(`${segamentOrigin}/import`, '_blank');
  window.addEventListener('message', handleRequestMessage);
})();