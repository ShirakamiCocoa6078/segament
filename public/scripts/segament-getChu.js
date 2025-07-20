// 파일 경로: public/scripts/segament-getChu.js

(function() {
  // 이 스크립트의 다른 부분에서 이 함수들을 사용한다고 가정합니다.
  // 실제 getChu.js 파일에 있는 함수명으로 대체해야 할 수 있습니다.
  async function getProfileData() { /* ... 기존 프로필 추출 로직 ... */ }
  async function getPlaylogs() { /* ... 기존 플레이로그 추출 로직 ... */ }
  async function getCourses() { /* ... 기존 코스 기록 추출 로직 ... */ }

  /**
   * 화면에 UI 오버레이를 생성하고 제어하는 함수
   */
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

  /**
   * 데이터 추출 및 서버 전송을 담당하는 메인 함수
   */
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

      const region = window.location.hostname.includes('-eng') ? 'INTL' : 'JP';
      updateProgress(`- 지역 감지: ${region}`);

      // 기존 데이터 추출 함수 호출 (실제 함수명에 맞게 수정 필요)
      const profileData = await getProfileData();
      const playlogsData = await getPlaylogs();
      const coursesData = await getCourses();
      updateProgress(`- 프로필 및 플레이로그 ${playlogsData.length}건 발견`);

      updateProgress('🚀 서버로 데이터를 전송합니다...');
      
      const response = await fetch('https://segament.vercel.app/api/v1/import/chunithm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'CHUNITHM',
          region: region,
          profile: profileData,
          playlogs: playlogsData,
          courses: coursesData,
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