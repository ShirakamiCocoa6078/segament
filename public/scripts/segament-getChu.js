// 파일 경로: public/scripts/segament-getChu.js

(function() {
  /**
   * =================================================
   * Segament Chunithm Data Getter
   * 기존 segament-getChu.js의 데이터 추출 로직을 UI 오버레이와 결합
   * =================================================
   */

  // --- 1. UI 오버레이 생성 및 제어 ---
  function createOverlay() {
    const existingOverlay = document.getElementById('segament-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'segament-overlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: '99999',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        backgroundColor: 'white', padding: '24px', borderRadius: '8px',
        width: '90%', maxWidth: '450px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    });
    
    modal.innerHTML = `
        <h2 style="margin-top:0; font-size: 1.25rem; font-weight: 600;">Segament 데이터 가져오기</h2>
        <p style="margin-top: 8px; font-size: 0.9rem; color: #555;">CHUNITHM-NET에서 플레이 데이터를 가져옵니다. 계속하시겠습니까?</p>
        <div id="segament-progress" style="text-align:left; margin-top:1.5rem; font-size:14px; background-color:#f3f4f6; border-radius: 4px; padding: 12px; height: 120px; overflow-y: auto;"></div>
        <div style="margin-top: 1.5rem;">
            <button id="segament-confirm-btn" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">확인</button>
            <button id="segament-cancel-btn" style="margin-left: 10px; padding: 10px 20px; background-color: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">취소</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return { overlay };
  }

  // --- 기존 segament-getChu.js의 유틸리티 함수들 ---
  const utils = {
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async fetchPageDoc(url) {
      console.log(`[segament getChunithm] GET: ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`페이지 로드 실패: ${url} (상태: ${response.status})`);
      await utils.sleep(250);
      const html = await response.text();
      return new DOMParser().parseFromString(html, 'text/html');
    },
    async fetchPageDocWithPost(url, token, diff) {
      const postUrl = `${url}send${diff}`;
      const body = new URLSearchParams({ genre: '99', token: token, diff: diff });
      console.log(`[segament getChunithm] POST: ${postUrl}`);
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      if (!response.ok) throw new Error(`POST 요청 실패: ${postUrl} (상태: ${response.status})`);
      await utils.sleep(250);
      const html = await response.text();
      return new DOMParser().parseFromString(html, 'text/html');
    },
    parseNumber(text) {
      if (!text) return 0;
      const match = text.match(/[\d,.]+/g);
      return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    }
  };

  // --- 기존 segament-getChu.js의 데이터 수집 함수들 ---
  async function collectPlayerData(homeDoc, playerDataDoc) {
    const profile = {};
    profile.team = { name: homeDoc.querySelector('.player_team_name')?.textContent.trim() || null, rank: (homeDoc.querySelector('[class^="player_team_emblem_"]')?.className.match(/player_team_emblem_(\w+)/) || [])[1] || null };
    const honorElements = homeDoc.querySelectorAll('.player_honor_short');
    profile.honors = Array.from(honorElements).map(el => ({ name: el.querySelector('.player_honor_text span')?.textContent.trim() || el.querySelector('.player_honor_text')?.textContent.trim() || null, rank: (el.style.backgroundImage.match(/honor_bg_(\w+)\.png/) || [])[1] || 'normal' }));
    profile.characterIcon = homeDoc.querySelector('.player_chara img')?.src || null;
    const battleRankImg = homeDoc.querySelector('.player_battlerank img')?.src;
    if (battleRankImg) { const match = battleRankImg.match(/battle_rank_(\w+?)(\d)\.png/); profile.battleRank = match ? { highRank: match[1], lowRank: parseInt(match[2]) } : null; }
    profile.level = utils.parseNumber(homeDoc.querySelector('.player_lv')?.textContent);
    profile.starRank = utils.parseNumber(homeDoc.querySelector('.player_reborn')?.textContent);
    profile.nickname = homeDoc.querySelector('.player_name_in')?.textContent.trim();
    const courseEmblemImg = homeDoc.querySelector('.player_classemblem_top img')?.src;
    profile.courseEmblem = courseEmblemImg ? (courseEmblemImg.match(/classemblem_medal_(\d+)\.png/) || [])[1] : null;
    const courseBgImg = homeDoc.querySelector('.box_playerprofile')?.style.backgroundImage;
    profile.courseEmblemBg = courseBgImg ? (courseBgImg.match(/profile_(\w+)\.png/) || [])[1] : null;
    const ratingImgs = homeDoc.querySelectorAll('.player_rating_num_block img');
    let ratingStr = '';
    ratingImgs.forEach(img => { if (img.src.includes('comma')) { ratingStr += '.'; } else { const match = img.src.match(/rating_\w+_(\d\d?)\.png/); if (match) ratingStr += match[1]; } });
    profile.rating = parseFloat(ratingStr) || 0;
    const opText = homeDoc.querySelector('.player_overpower_text')?.textContent || '';
    const opMatch = opText.match(/([\d,.]+)\s*\((\d+\.\d+)%\)/);
    profile.overpower = opMatch ? { value: utils.parseNumber(opMatch[1]), percent: parseFloat(opMatch[2]) } : { value: 0, percent: 0 };
    profile.lastPlayDate = homeDoc.querySelector('.player_lastplaydate_text')?.textContent.trim();
    profile.friendCode = playerDataDoc.querySelector('.user_data_friend_tap span[style*="display:none"]')?.textContent.trim();
    profile.totalPlayCount = utils.parseNumber(playerDataDoc.querySelector('.user_data_play_count')?.textContent);
    profile.lastUpdateDate = new Date().toISOString();
    return profile;
  }

  async function collectAllMusicPlays(musicRecordDoc, token) {
    const difficulties = ['Basic', 'Advanced', 'Expert', 'Master', 'Ultima'];
    const allMusicPlays = {};
    const parseMusicRecord = (formElement) => {
      const icons = Array.from(formElement.querySelectorAll('.play_musicdata_icon img')).map(img => (img.src.match(/icon_(\w+)\.png/) || [])[1]);
      return {
        title: formElement.querySelector('.music_title')?.textContent.trim(),
        score: utils.parseNumber(formElement.querySelector('.play_musicdata_highscore')?.textContent),
        icons: icons,
        idx: formElement.querySelector('input[name="idx"]')?.value
      };
    };
    for (const diff of difficulties) {
      const diffDoc = await utils.fetchPageDocWithPost(musicRecordDoc.baseURI.replace('/musicGenre/', '/musicGenre/'), token, diff);
      const musicForms = diffDoc.querySelectorAll('form[action*="sendMusicDetail"]');
      allMusicPlays[diff.toUpperCase()] = Array.from(musicForms).map(parseMusicRecord);
    }
    return allMusicPlays;
  }

  async function collectCourse(doc) {
    const coursePlays = [];
    const courseFrames = doc.querySelectorAll('form[action*="sendCourseDetail"]');
    courseFrames.forEach(frame => {
      const play = {};
      const musicListBox = frame.querySelector('.musiclist_box');
      play.className = (musicListBox?.className.match(/bg_class(\d+)/) || [])[1];
      play.title = frame.querySelector('.music_title')?.textContent.trim();
      play.score = utils.parseNumber(frame.querySelector('.play_musicdata_highscore')?.textContent);
      play.icons = Array.from(frame.querySelectorAll('.play_musicdata_icon img')).map(img => (img.src.match(/icon_(\w+)\.png/) || [])[1]);
      coursePlays.push(play);
    });
    return coursePlays;
  }

  // --- 2. 데이터 추출 및 서버 전송을 담당하는 메인 함수 ---
  async function runImport() {
    const progressDiv = document.getElementById('segament-progress');
    const confirmBtn = document.getElementById('segament-confirm-btn');
    const cancelBtn = document.getElementById('segament-cancel-btn');
    
    confirmBtn.disabled = true;
    confirmBtn.style.backgroundColor = '#9ca3af';
    cancelBtn.style.display = 'none';

    const updateProgress = (message) => {
        progressDiv.innerHTML += `<div>${message}</div>`;
        progressDiv.scrollTop = progressDiv.scrollHeight;
    };

    try {
        updateProgress('✅ 데이터 추출을 시작합니다...');

        // --- 기존 segament-getChu.js 로직 시작 ---
        const isInternational = location.hostname === 'chunithm-net-eng.com';
        const region = isInternational ? 'INTL' : 'JP';
        updateProgress(`- 지역 감지: ${region}`);

        const baseUrl = isInternational ?
            'https://chunithm-net-eng.com/mobile/' :
            'https://new.chunithm-net.com/chuni-mobile/html/mobile/';

        const urls = {
          home: `${baseUrl}home/`,
          playerData: `${baseUrl}home/playerData/`,
          musicRecord: `${baseUrl}record/musicGenre/`,
          course: `${baseUrl}record/courseList/`,
        };
        
        // --- 데이터 수집 실행 ---
        updateProgress('📊 프로필 데이터 수집 중...');
        const [homeDoc, playerDataDoc] = await Promise.all([utils.fetchPageDoc(urls.home), utils.fetchPageDoc(urls.playerData)]);
        const playerProfile = await collectPlayerData(homeDoc, playerDataDoc);
        updateProgress(`- 플레이어: ${playerProfile.nickname} (레이팅: ${playerProfile.rating})`);

        updateProgress('🎵 플레이로그 수집 중...');
        const musicRecordDoc = await utils.fetchPageDoc(urls.musicRecord);
        const token = musicRecordDoc.querySelector('input[name="token"]')?.value;
        if (!token) throw new Error('토큰을 찾을 수 없습니다.');
        
        const allMusicPlays = await collectAllMusicPlays(musicRecordDoc, token);
        const totalPlaylogs = Object.values(allMusicPlays).reduce((sum, plays) => sum + plays.length, 0);
        updateProgress(`- 플레이 기록: ${totalPlaylogs}건 발견`);

        updateProgress('🏆 코스 데이터 수집 중...');
        const courseDoc = await utils.fetchPageDoc(urls.course);
        const coursePlays = await collectCourse(courseDoc);
        updateProgress(`- 코스 기록: ${coursePlays.length}건 발견`);

        const finalData = {
          profile: playerProfile,
          playlogs: allMusicPlays,
          courses: coursePlays
        };
        
        updateProgress('🚀 서버로 데이터를 전송합니다...');
      
        const response = await fetch('https://segament.vercel.app/api/v1/import/chunithm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gameType: 'CHUNITHM',
                region: region,
                profile: finalData.profile,
                playlogs: finalData.playlogs,
                courses: finalData.courses
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`서버 응답 오류 (${response.status}): ${errorData.message || '알 수 없는 오류'}`);
        }

        updateProgress('🎉 성공! 데이터가 성공적으로 반영되었습니다.');
        updateProgress('3초 뒤에 이 창은 자동으로 닫힙니다.');
        setTimeout(() => document.getElementById('segament-overlay')?.remove(), 3000);

    } catch (error) {
      updateProgress(`❌ 오류 발생: ${error.message}`);
      confirmBtn.style.display = 'none';
      cancelBtn.innerText = '닫기';
      cancelBtn.style.display = 'inline-block';
      cancelBtn.style.backgroundColor = '#6b7280';
    }
  }

  // --- 스크립트 실행 시작점 ---
  const { overlay } = createOverlay();
  
  document.getElementById('segament-confirm-btn').onclick = runImport;
  document.getElementById('segament-cancel-btn').onclick = () => overlay.remove();

})();