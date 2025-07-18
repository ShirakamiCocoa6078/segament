/**
 * =================================================
 * Segament Chunithm Data Getter (segament-getchu.js)
 * =================================================
 * CHUNITHM-NET에서 플레이어 데이터를 수집하여 Segament 서버로 전송합니다.
 * 내수판과 국제판을 모두 지원하며, 각 수집 단계의 안정성을 강화했습니다.
 * @version 0.5 - All data collection features implemented and bugs fixed.
 */

(async function main() {
	console.log('[segament getChunithm] 데이터 수집을 시작합니다.');

	// --- 설정 및 URL 정의 ---
	const isInternational = location.hostname === 'chunithm-net-eng.com';
	const baseUrl = isInternational ?
		'https://chunithm-net-eng.com/mobile/' :
		'https://new.chunithm-net.com/chuni-mobile/html/mobile/';

	const urls = {
		home: `${baseUrl}home/`,
		playerData: `${baseUrl}home/playerData/`,
		ratingBest: `${baseUrl}home/playerData/ratingDetailBest/`,
		ratingRecent: `${baseUrl}home/playerData/ratingDetailRecent/`,
		ratingNext: `${baseUrl}home/playerData/ratingDetailNext/`,
		recentPlays: `${baseUrl}record/playlog/`,
		musicRecord: `${baseUrl}record/musicGenre/`,
		worldsEnd: `${baseUrl}record/worldsEndList/`,
		course: `${baseUrl}record/courseList/`,
		characterCollection: `${baseUrl}collection/`,
		characterList: `${baseUrl}collection/characterList/`,
		customise: `${baseUrl}collection/customise/`,
	};

	// --- 유틸리티 함수 ---
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
		},
		downloadJson(jsonData, filename) {
			const dataStr = JSON.stringify(jsonData, null, 2);
			const blob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			console.log(`[segament getChunithm] ${filename} 파일 다운로드를 시작합니다.`);
		}
	};

	// --- 데이터 수집 함수들 ---

	async function collectPlayerData(homeDoc, playerDataDoc) {
		console.log('[segament getChunithm] 플레이어 프로필 데이터를 수집 중...');
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
		console.log('[segament getChunithm] 플레이어 프로필 수집 완료.', profile);
		return profile;
	}

	async function collectRatingData(bestDoc, recentDoc, nextDoc) {
		console.log('[segament getChunithm] 레이팅 대상곡 데이터를 수집 중...');
		const ratingData = {};
		const parseMusic = (formElement) => ({ title: formElement.querySelector('.music_title')?.textContent.trim(), score: utils.parseNumber(formElement.querySelector('.play_musicdata_highscore')?.textContent), difficulty: (formElement.querySelector('.musiclist_box')?.className.match(/bg_(\w+)/) || [])[1], idx: formElement.querySelector('input[name="idx"]')?.value });
		ratingData.best = Array.from(bestDoc.querySelectorAll('form[action*="sendMusicDetail"]')).map(parseMusic);
		ratingData.recent = Array.from(recentDoc.querySelectorAll('form[action*="sendMusicDetail"]')).map(parseMusic);
		const nextSections = nextDoc.querySelectorAll('.box01.w420');
		if (nextSections.length >= 2) {
			ratingData.auxiliary = {
				best: Array.from(nextSections[0].querySelectorAll('form[action*="sendMusicDetail"]')).map(parseMusic),
				recent: Array.from(nextSections[1].querySelectorAll('form[action*="sendMusicDetail"]')).map(parseMusic),
			};
		}
		console.log('[segament getChunithm] 레이팅 대상곡 데이터 수집 완료.', ratingData);
		return ratingData;
	}

	async function collectRecentPlays(playlogDoc) {
		console.log('[segament getChunithm] 최근 플레이 기록을 수집 중...');
		const recentPlays = [];
		const playlogFrames = playlogDoc.querySelectorAll('.frame02.w400');
		playlogFrames.forEach(frame => {
			const play = {};
			play.playDate = frame.querySelector('.play_datalist_date')?.textContent.trim();
			play.jacketUrl = frame.querySelector('.play_jacket_img img')?.getAttribute('data-original') || frame.querySelector('.play_jacket_img img')?.src;
			play.track = frame.querySelector('.play_track_text')?.textContent.trim();
			play.difficulty = (frame.querySelector('.play_track_result img')?.src.match(/musiclevel_(\w+)\.png/) || [])[1];
			play.title = frame.querySelector('.play_musicdata_title')?.textContent.trim();
			play.score = utils.parseNumber(frame.querySelector('.play_musicdata_score_text')?.textContent);
			play.isNewRecord = !!frame.querySelector('.play_musicdata_score_img');
			play.icons = Array.from(frame.querySelectorAll('.play_musicdata_icon img')).map(img => (img.src.match(/icon_(\w+)\.png/) || [])[1]);
			recentPlays.push(play);
		});
		console.log(`[segament getChunithm] 최근 플레이 기록 ${recentPlays.length}건 수집 완료.`);
		return recentPlays;
	}

	async function collectAllMusicPlays(musicRecordDoc, token) {
		console.log('[segament getChunithm] 전체 악곡 기록 수집을 시작합니다...');
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
			console.log(`[segament getChunithm] ${diff} 난이도 기록을 수집 중...`);
			const diffDoc = await utils.fetchPageDocWithPost(urls.musicRecord, token, diff);
			const musicForms = diffDoc.querySelectorAll('form[action*="sendMusicDetail"]');
			allMusicPlays[diff.toUpperCase()] = Array.from(musicForms).map(parseMusicRecord);
		}
		console.log('[segament getChunithm] 전체 악곡 기록 수집 완료.');
		return allMusicPlays;
	}

	async function collectWorldsEnd(doc) {
		console.log('[segament getChunithm] WORLD\'S END 기록을 수집 중...');
		const worldsendPlays = [];
		const musicFrames = doc.querySelectorAll('form[action*="sendWorldsEndDetail"]');
		musicFrames.forEach(frame => {
			const play = {};
			play.title = frame.querySelector('.musiclist_worldsend_title')?.textContent.trim();
			play.score = utils.parseNumber(frame.querySelector('.play_musicdata_highscore .text_b')?.textContent);
			play.icons = Array.from(frame.querySelectorAll('.play_musicdata_icon img')).map(img => (img.src.match(/icon_(\w+)\.png/) || [])[1]);
			worldsendPlays.push(play);
		});
		console.log(`[segament getChunithm] WORLD'S END 기록 ${worldsendPlays.length}건 수집 완료.`);
		return worldsendPlays;
	}

	async function collectCourse(doc) {
		console.log('[segament getChunithm] 코스 기록을 수집 중...');
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
		console.log(`[segament getChunithm] 코스 기록 ${coursePlays.length}건 수집 완료.`);
		return coursePlays;
	}

	async function collectCharacterAndCustomise(collectionDoc, customiseDoc) {
		console.log('[segament getChunithm] 캐릭터 및 커스터마이즈 정보를 수집 중...');
		const data = {};
		const rankNumBlock = collectionDoc.querySelector('.character_lv_box_num');
		let rankStr = '';
		if (rankNumBlock) {
			rankNumBlock.querySelectorAll('img').forEach(img => {
				const match = img.src.match(/num_lv_(\d)\.png/);
				if (match) rankStr += match[1];
			});
		}
		data.character = {
			name: collectionDoc.querySelector('.character_image_box_name')?.textContent.trim(),
			rank: parseInt(rankStr) || 0,
		};
		data.customise = {
			nameplate: customiseDoc.querySelector('.nameplate_block img')?.src,
			mapicon: customiseDoc.querySelector('.mapicon_block img')?.src,
		};
		console.log('[segament getChunithm] 캐릭터 및 커스터마이즈 정보 수집 완료.');
		return data;
	}

	// --- 메인 실행 로직 ---
	try {
		const finalData = {};
		
		// 각 데이터 수집을 순차적으로 실행하여 안정성 확보
		const [homeDoc, playerDataDoc] = await Promise.all([utils.fetchPageDoc(urls.home), utils.fetchPageDoc(urls.playerData)]);
		finalData.playerProfile = collectPlayerData(homeDoc, playerDataDoc);

		const [bestDoc, recentDoc, nextDoc] = await Promise.all([utils.fetchPageDoc(urls.ratingBest), utils.fetchPageDoc(urls.ratingRecent), utils.fetchPageDoc(urls.ratingNext)]);
		finalData.ratingTargetSongs = collectRatingData(bestDoc, recentDoc, nextDoc);

		const recentPlaysDoc = await utils.fetchPageDoc(urls.recentPlays);
		finalData.recentPlays = collectRecentPlays(recentPlaysDoc);
		
		const musicRecordDoc = await utils.fetchPageDoc(urls.musicRecord);
		const token = musicRecordDoc.querySelector('input[name="token"]')?.value;
		if (token) {
			finalData.allMusicPlays = await collectAllMusicPlays(musicRecordDoc, token);
		} else {
			console.error('[segament getChunithm] 전체 악곡 기록 수집 실패: 토큰을 찾을 수 없습니다.');
			finalData.allMusicPlays = { error: 'Token not found' };
		}

		const worldsEndDoc = await utils.fetchPageDoc(urls.worldsEnd);
		finalData.worldsEndPlays = await collectWorldsEnd(worldsEndDoc);

		const courseDoc = await utils.fetchPageDoc(urls.course);
		finalData.coursePlays = await collectCourse(courseDoc);
		
		const [collectionDoc, customiseDoc] = await Promise.all([utils.fetchPageDoc(urls.characterCollection), utils.fetchPageDoc(urls.customise)]);
		const characterAndCustomiseData = await collectCharacterAndCustomise(collectionDoc, customiseDoc);
		finalData.character = characterAndCustomiseData.character;
		finalData.customise = characterAndCustomiseData.customise;

		console.log('[segament getChunithm] 최종 데이터:', finalData);
		utils.downloadJson(finalData, 'segament-data-result.json');

	} catch (error) {
		console.error('[segament getChunithm] 전체 데이터 수집 과정에서 예기치 않은 오류 발생:', error);
		alert('스크립트 실행 중 예기치 않은 오류가 발생했습니다. 개발자 콘솔을 확인해주세요.');
	}

})();
