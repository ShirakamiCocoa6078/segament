// integrated_script.js (최종 완성본)

// --- 1. 의존성 라이브러리 임포트 ---
import { chromium } from 'playwright';
import axios from 'axios';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import readline from 'readline';
import path from 'path';

// --- 2. 환경변수 설정 ---
dotenv.config();
const { CHUNIREC_ACCESS_TOKEN, CHUNIREC_USER_NAME, GOOGLE_API_KEY, GOOGLE_SHEET_ID, SEGA_ID, SEGA_PASSWORD } = process.env;

// --- 3. 설정 및 상수 정의 ---
const C = {
    CATEGORY_DATA_FILE: 'chunithm-category-data.json',
    UPDATED_MUSIC_FILE: 'chunithm-music-updated.json',
    FINAL_SONG_DATA_FILE: 'chunithmSongData.json',
    PREVIOUS_SONG_DATA_FILE: 'chunithmSongData2.json',
        RESULTS_DIR: '../src/lib',
    STAGE_1_COMPLETE_FLAG: '_stage1_complete.json',
    STAGE_2_COMPLETE_FLAG: '_stage2_complete.json',
    STAGE_3_COMPLETE_FLAG: '_stage3_complete.json',
    CHUNIREC_API_URL: 'https://api.chunirec.net/2.0/music/showall.json',
};
function normalizeDifficulty(sheetDifficulty) {
    if (!sheetDifficulty || typeof sheetDifficulty !== 'string') return '';
    const upperDiff = sheetDifficulty.toUpperCase();
    const map = { 'MASTER': 'MAS', 'ULTIMA': 'ULT', 'EXPERT': 'EXP', 'ADVANCED': 'ADV', 'BASIC': 'BAS' };
    return map[upperDiff] || upperDiff;
}
// --- 설정 ---
function formatLevelFromConst(constant) {
    if (typeof constant !== 'number' || constant === 0) return "";
    const integer = Math.floor(constant);
    const decimal = constant - integer;
    // 0 ~ 0.49 -> n, 0.5 ~ 0.99 -> n+
    return decimal >= 0.5 ? `${integer}+` : String(integer);
}
const SHEET_NAMES_TO_FETCH = [ '新曲のみ', '15,15+', '14+', '14', '13.8～13.9', '13.5～13.7', '13', '12+', '12', '11+', '11以下' ];
const API_BASE_URL = 'https://api.chunirec.net/2.0';
const apiConfig = { params: { region: 'jp2', token: CHUNIREC_ACCESS_TOKEN, user_name: CHUNIREC_USER_NAME || undefined } };
const BASE_DATA_PATH = path.join(process.cwd(), 'chunithm_baseData.json');

// --- 4. 유틸리티 함수 ---
const log = (message, type = 'info') => {
    const colors = { info: '\x1b[36m', success: '\x1b[32m', error: '\x1b[31m', warn: '\x1b[33m', reset: '\x1b[0m' };
    console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
};
const askQuestion = (query) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
};
function randomWait(min = 1500, max = 2000) {
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    log(`[대기] ${duration / 1000}초 동안 대기합니다...`);
    return new Promise(resolve => setTimeout(resolve, duration));
}
function normalizeTitle(title) {
    if (typeof title !== 'string') return '';
    return title.toLowerCase().normalize('NFKC').replace(/\s+/g, '').replace(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '');
}

// --- 5. 각 단계별 실행 함수 ---

async function runStage1_ScrapeData() {
    log('1단계 시작: CHUNITHM-NET 로그인 및 상세 데이터 스크래핑...');
    if (!SEGA_ID || !SEGA_PASSWORD) throw new Error('.env 파일에 SEGA_ID와 SEGA_PASSWORD를 설정해야 합니다.');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' });
    const page = await context.newPage();
    const finalData = { genre: {}, version: {}, level: {} };
    const BASE_URL = 'https://new.chunithm-net.com/chuni-mobile/html/mobile/record/';
    const difficultyMap = { 0: 'BASIC', 1: 'ADVANCED', 2: 'EXPERT', 3: 'MASTER', 4: 'ULTIMA', 5: 'WORLD\'S END' };
    try {
        log('로그인 절차를 시작합니다...');
        await page.goto('https://new.chunithm-net.com/');
        await page.locator('input[name="segaId"]').fill(SEGA_ID);
        await page.locator('input[name="password"]').fill(SEGA_PASSWORD);
        await page.locator('button.btn_login').click();
        await page.waitForURL('**/aimeList/');
        await page.locator('button.btn_select_aime').click();
        await page.waitForURL('**/home/');
        log('로그인 성공!', 'success');
        await randomWait();
        const categories = [{ name: '장르', url: 'musicGenre/', select: 'genre' }, { name: '버전', url: 'musicVersion/', select: 'version' }];
        for (const cat of categories) {
            log(`${cat.name}별 데이터 수집 중...`);
            await page.goto(`${BASE_URL}${cat.url}`, { waitUntil: 'networkidle' });
            const options = await page.evaluate((selector) => Array.from(document.querySelectorAll(`select[name="${selector}"] option`)).filter(o => o.value && o.text !== '全ジャンル').map(o => ({ value: o.value, text: o.text })), cat.select);
            for (const option of options) {
                await page.selectOption(`select[name="${cat.select}"]`, option.value);
                await page.locator(`.difficulty_btn_record[onclick*="'Basic'"]`).click();
                await page.waitForLoadState('networkidle');
                const musicGroup = finalData[cat.select.toLowerCase()][option.text] = {};
                const elements = await page.locator('.musiclist_box').all();
                for (const el of elements) {
                    const idx = await el.locator('input[name="idx"]').inputValue();
                    const title = await el.locator('.music_title').innerText();
                    musicGroup[`music_idx_${idx}`] = { music_name: title };
                }
            }
        }
        log('레벨별 데이터 수집 중...');
        await page.goto(`${BASE_URL}musicLevel/`, { waitUntil: 'networkidle' });
        const levelOptions = await page.evaluate(() => Array.from(document.querySelectorAll('select[name="level"] option')).filter(o => o.value).map(o => ({ value: o.value, text: o.text })));
        for (const option of levelOptions) {
            await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), page.selectOption('select[name="level"]', option.value)]);
            finalData.level[option.text] = {};
            const elements = await page.locator('.musiclist_box').all();
            for (const el of elements) {
                const idx = await el.locator('input[name="idx"]').inputValue();
                const title = await el.locator('.music_title').innerText();
                const diffVal = await el.locator('input[name="diff"]').inputValue();
                finalData.level[option.text][`music_idx_${idx}`] = { music_name: title, diff: difficultyMap[diffVal] || 'UNKNOWN' };
            }
        }
        await fs.writeJson(C.CATEGORY_DATA_FILE, finalData, { spaces: 2 });
        await fs.writeJson(C.STAGE_1_COMPLETE_FLAG, { completedAt: new Date() });
        log('1단계 성공적으로 완료.', 'success');
    } catch (error) {
        log(`1단계 실행 중 오류 발생: ${error.message}`, 'error');
        await page.screenshot({ path: 'stage1_error_screenshot.png' });
        log('오류 발생 시점의 스크린샷을 stage1_error_screenshot.png 로 저장했습니다.');
        throw error;
    } finally {
        await browser.close();
    }
}

async function runStage2_UpdateFromAPIs() {
    log('3단계 시작: chunithmSongData2.json을 기반으로 sheetData.json 상수 병합...');
    try {
        // categoryData 로드
        const categoryData = await fs.readJson(C.CATEGORY_DATA_FILE);

        // --- chunithmSongData2.json을 baseData로 사용 ---
        if (!await fs.exists(C.PREVIOUS_SONG_DATA_FILE)) {
            throw new Error('chunithmSongData2.json 파일이 존재하지 않습니다.');
        }
        let baseData = await fs.readJson(C.PREVIOUS_SONG_DATA_FILE);
        log(`[Updater]  - chunithmSongData2.json에서 ${baseData.length}개의 곡을 불러왔습니다.`);

        // sheetData.json에서 상수 데이터 병합
        log('[Updater]  - sheetData.json에서 상수 데이터를 가져오는 중...');
        const sheetData = await fs.readJson('sheetData.json');
        function normalizeTitle(title) {
            if (typeof title !== 'string') return '';
            return title.toLowerCase().normalize('NFKC').replace(/\s+/g, '').replace(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '');
        }
        const sheetDataMap = new Map();
        for (const [title, diffs] of Object.entries(sheetData)) {
            for (const [diffRaw, vals] of Object.entries(diffs)) {
                const diffMap = { BAS: 'basic', ADV: 'advanced', EXP: 'expert', MAS: 'master', ULT: 'ultima' };
                const diffKey = diffMap[diffRaw] || diffRaw.toLowerCase();
                let finalConst = vals.newVersion !== null ? vals.newVersion : vals.oldVersion;
                if (finalConst !== null) {
                    const normKey = `${normalizeTitle(title)}-${diffKey}`;
                    sheetDataMap.set(normKey, { const: finalConst, level: null });
                }
            }
        }
        log(`[Updater]  - sheetData.json에서 ${sheetDataMap.size}개의 상수 데이터를 불러왔습니다.`);

        // baseData에 sheetDataMap의 상수(newVersion 우선) 반영
        log('[Updater]  - baseData에 sheetData.json 상수 병합 중...');
        baseData.forEach(music => {
            Object.keys(music.data).forEach(diffKey => {
                const normKey = `${normalizeTitle(music.meta.title)}-${diffKey}`;
                if (sheetDataMap.has(normKey)) {
                    const sheetInfo = sheetDataMap.get(normKey);
                    if (sheetInfo.const !== null) {
                        music.data[diffKey].const = sheetInfo.const;
                    }
                    if (sheetInfo.level) {
                        music.data[diffKey].level = sheetInfo.level;
                    }
                }
            });
        });

        await fs.writeJson(C.UPDATED_MUSIC_FILE, baseData, { spaces: 2 });
        log(`✅ [1/7] chunithm_baseData.json 파일이 성공적으로 생성되었습니다.`);

        // --- 4단계: category-data.json을 기준으로 최종 데이터 구조 생성 ---
        log('[Updater] [2/7] category-data.json을 기준으로 최종 데이터 구조 생성...');
        const baseDataMap = new Map();
        baseData.forEach(song => baseDataMap.set(song.meta.title, song));
        const finalSongMap = new Map();
        // category-data.json의 모든 곡을 기준으로 뼈대 생성
        ['genre', 'version'].forEach(categoryKey => {
            const category = categoryData[categoryKey];
            for (const subCategoryKey in category) {
                const songs = category[subCategoryKey];
                for (const songKey in songs) {
                    const idx = songKey.replace('music_idx_', '');
                    const songDetails = songs[songKey];
                    if (!finalSongMap.has(idx)) {
                        finalSongMap.set(idx, {
                            meta: { id: idx, title: songDetails.music_name, genre: 'N/A', version: 'N/A' },
                            data: {
                                basic: { level: "", const: 0 },
                                advanced: { level: "", const: 0 },
                                expert: { level: "", const: 0 },
                                master: { level: "", const: 0 },
                            }
                        });
                    }
                    const songEntry = finalSongMap.get(idx);
                    if (categoryKey === 'genre') songEntry.meta.genre = subCategoryKey;
                    if (categoryKey === 'version') songEntry.meta.version = subCategoryKey;
                }
            }
        });

        log('[Updater] [3/7] 레벨 정보 채우기...');
        // 레벨 정보 채우기
        const levelCategory = categoryData.level;
        for (const levelKey in levelCategory) {
            const songs = levelCategory[levelKey];
            for (const songKey in songs) {
                const idx = songKey.replace('music_idx_', '');
                const songDetails = songs[songKey];
                if (finalSongMap.has(idx)) {
                    const songEntry = finalSongMap.get(idx);
                    const difficultyKey = songDetails.diff.toLowerCase();
                    if (difficultyKey !== 'unknown') {
                        if (!songEntry.data[difficultyKey]) songEntry.data[difficultyKey] = {};
                        songEntry.data[difficultyKey].level = songDetails.level;
                    }
                }
            }
        }

        log('[Updater] [4/7] baseData(시트 반영)로 상수 채우기...');
        // baseData(시트 반영)의 상수로 최종 데이터 채우기
        finalSongMap.forEach(songEntry => {
            const baseSong = baseDataMap.get(songEntry.meta.title);
            if (baseSong) {
                 Object.keys(songEntry.data).forEach(diffKey => {
                    if (baseSong.data[diffKey] && baseSong.data[diffKey].const > 0) {
                        songEntry.data[diffKey].const = baseSong.data[diffKey].const;
                    }
                 });
            }
        });

        log('[Updater] [5/7] const가 0인 경우, level 기반으로 상수 재설정...');
        // 최종 데이터 후처리
        finalSongMap.forEach(songEntry => {
            Object.keys(songEntry.data).forEach(diffKey => {
                const chart = songEntry.data[diffKey];
                if ((!chart.const || chart.const === 0) && chart.level && chart.level !== "") {
                    if (String(chart.level).includes('+')) {
                        chart.const = parseFloat(String(chart.level).replace('+', '.5'));
                    } else {
                        chart.const = parseFloat(chart.level);
                    }
                    log(`[상수 추정] ${songEntry.meta.title} (${diffKey}) -> ${chart.const}`);
                }
            });
        });

        log('[Updater] [6/7] const 기반으로 level 포맷팅 및 최종 검증...');
        finalSongMap.forEach(songEntry => {
            Object.keys(songEntry.data).forEach(diffKey => {
                const chart = songEntry.data[diffKey];
                if (chart.const > 0) {
                    chart.level = formatLevelFromConst(chart.const);
                }
            });
        });

        // --- 최종 데이터 저장 직전 sheetDataMap을 한 번 더 덮어씌우기 (newVersion 우선 보장) ---
        finalSongMap.forEach(songEntry => {
            Object.keys(songEntry.data).forEach(diffKey => {
                const normKey = `${normalizeTitle(songEntry.meta.title)}-${diffKey}`;
                if (sheetDataMap.has(normKey)) {
                    const sheetInfo = sheetDataMap.get(normKey);
                    if (sheetInfo.const !== null) {
                        songEntry.data[diffKey].const = sheetInfo.const;
                    }
                    if (sheetInfo.level) {
                        songEntry.data[diffKey].level = sheetInfo.level;
                    }
                }
            });
        });
        const finalData = Array.from(finalSongMap.values());
        await fs.writeJson(C.UPDATED_MUSIC_FILE, finalData, { spaces: 2 });
        log(`'${C.UPDATED_MUSIC_FILE}' 파일 저장 완료. (총 ${finalData.length}곡)`);
        await fs.writeJson(C.STAGE_2_COMPLETE_FLAG, { completedAt: new Date() });
        log('2단계 성공적으로 완료.', 'success');
    } catch (error) {
        log(`2단계 실행 중 오류 발생: ${error.message}`, 'error');
        console.error(error);
        throw error;
    }
}

async function runStage3_FinalizeData() {
    log('3단계 시작: 보조 데이터로 정보 보강 및 최종 처리...');
    try {
        const musicData = await fs.readJson(C.UPDATED_MUSIC_FILE);
        const categoryData = await fs.readJson(C.CATEGORY_DATA_FILE);
        if (musicData.length === 0) throw new Error("2단계에서 처리된 곡이 없어 3단계를 진행할 수 없습니다.");

        // 1. 카테고리 데이터에서 레벨 정보 재구성
        const levelLookup = {};
        for (const [levelStr, musics] of Object.entries(categoryData.level || {})) {
            for (const [musicKey, musicInfo] of Object.entries(musics)) {
                const musicId = musicKey.split('_').pop();
                if (!levelLookup[musicId]) levelLookup[musicId] = {};
                levelLookup[musicId][(musicInfo.diff || '').toLowerCase()] = levelStr.replace('LEVEL ', '');
            }
        }

        // 2. 데이터 1차 보정 (레벨 정보 추가 및 저레벨 상수 자동 수정)
        log('--- 1차 데이터 보정 시작 ---');
        for (const song of musicData) {
            const songId = song.meta.id;
            for (const diff of ['basic', 'advanced', 'expert', 'master', 'ultima']) {
                if (song.data[diff]) {
                    const diffData = song.data[diff];
                    // level이 없으면 카테고리 데이터에서 찾아 추가
                    if (!('level' in diffData) && levelLookup[songId] && levelLookup[songId][diff]) {
                        diffData.level = levelLookup[songId][diff];
                        log(`ID: ${songId}, 제목: ${song.meta.title} - ${diff.toUpperCase()} 레벨 정보 추가됨: ${diffData.level}`);
                    }
                    // level이 있고 const가 0인 경우, 레벨 1~10에 대해 const 자동 수정
                    if ('level' in diffData && typeof diffData.const === 'number' && diffData.const === 0) {
                        const levelVal = diffData.level;
                        if (typeof levelVal === 'string') {
                            try {
                                if (levelVal.includes('+')) {
                                    const baseLevel = parseInt(levelVal.replace('+', ''));
                                    if (baseLevel >= 1 && baseLevel <= 10) {
                                        diffData.const = baseLevel + 0.5;
                                    }
                                } else {
                                    const baseLevel = parseInt(levelVal);
                                    if (baseLevel >= 1 && baseLevel <= 10) {
                                        diffData.const = baseLevel;
                                    }
                                }
                            } catch (e) {}
                        }
                    }
                }
            }
        }
        log('--- 1차 데이터 보정 완료 ---');

        // 3. 레벨 누락 곡 확인
        const missingLevelSongs = [];
        for (const song of musicData) {
            for (const diff of ['basic', 'advanced', 'expert', 'master', 'ultima']) {
                if (song.data[diff] && !('level' in song.data[diff])) {
                    missingLevelSongs.push(`ID: ${song.meta.id}, 제목: ${song.meta.title}`);
                    break;
                }
            }
        }
        if (missingLevelSongs.length > 0) {
            log('--- ⚠️ 레벨 정보 누락 곡 ---');
            missingLevelSongs.forEach(log);
            log('--------------------');
        } else {
            log('✅ 레벨 정보 누락 곡 없음');
        }

        // 4. chunithmSongData2.json 파일에서 상수 값 미리 채우기
        log('--- 2차 데이터 보정 시작 (chunithmSongData2.json) ---');
        let prefillLookup = {};
        if (await fs.exists(C.PREVIOUS_SONG_DATA_FILE)) {
            try {
                const prefillData = await fs.readJson(C.PREVIOUS_SONG_DATA_FILE);
                for (const item of prefillData) {
                    prefillLookup[item.meta.id] = item.data;
                }
                log(`'${C.PREVIOUS_SONG_DATA_FILE}' 파일을 로드했습니다. 상수 자동 입력을 시도합니다.`);
                for (const song of musicData) {
                    const songId = song.meta.id;
                    if (prefillLookup[songId]) {
                        for (const diff of Object.keys(song.data)) {
                            const diffData = song.data[diff];
                            if ('const' in diffData && diffData.const === 0 &&
                                prefillLookup[songId][diff] && prefillLookup[songId][diff].const && prefillLookup[songId][diff].const !== 0) {
                                const newConst = prefillLookup[songId][diff].const;
                                // 기존 값과 다를 때만 로그 출력
                                if (diffData.const != newConst) {
                                    log(`  ID: ${songId}, 제목: ${song.meta.title} - ${diff.toUpperCase()} 상수 자동 입력됨: ${diffData.const} -> ${newConst}`);
                                    diffData.const = newConst;
                                } else {
                                    diffData.const = newConst;
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                log(`⚠️ 오류: '${C.PREVIOUS_SONG_DATA_FILE}' 파일 처리 중 에러 발생: ${e.message}`);
            }
        } else {
            log(`'${C.PREVIOUS_SONG_DATA_FILE}' 파일이 없어 상수 자동 입력을 건너뜁니다.`);
        }
        log('--- 2차 데이터 보정 완료 ---');

        // 5. const가 0인 경우 사용자 수동 입력
        log('--- ⌨️ 상수 수동 설정 시작 ---');
        for (const song of musicData) {
            const title = song.meta.title;
            for (const diff of Object.keys(song.data)) {
                const diffData = song.data[diff];
                // ?가 붙은 상수도 수동 입력 대상으로 체크
                const isManualConst = (typeof diffData.const === 'string' && diffData.const.endsWith('?')) || (typeof diffData.const === 'number' && diffData.const === 0);
                if ('const' in diffData && isManualConst && 'level' in diffData) {
                    const level = diffData.level;
                    log(`📋 '${title}' 곡명을 복사해 입력창에 붙여넣으세요.`);
                    while (true) {
                        const prompt = `${title}의 ${diff.toUpperCase()} 상수 설정 / 현재 레벨: ${level}\nconst : `;
                        const userInput = await askQuestion(prompt);
                        const constVal = parseFloat(userInput);
                        if (!isNaN(constVal)) {
                            if (constVal === 0) {
                                // 0 입력 시, 레벨값에 따라 ?가 붙은 상수로 저장
                                let baseLevel = 0;
                                if (typeof level === 'string' && level.includes('+')) {
                                    baseLevel = parseInt(level.replace('+', '')) + 0.5;
                                } else {
                                    baseLevel = parseFloat(level);
                                }
                                diffData.const = `${baseLevel}?`;
                                log(`0이 입력되어, 상수를 '${diffData.const}'로 임시 저장합니다. 이후 재실행 시 다시 입력 요청됩니다.`);
                                break;
                            } else {
                                diffData.const = constVal;
                                break;
                            }
                        } else {
                            log('⚠️ 잘못된 입력입니다. 숫자를 입력해주세요.');
                        }
                    }
                }
            }
        }
        log('--- 상수 수동 설정 완료 ---');

        await fs.writeJson(C.FINAL_SONG_DATA_FILE, musicData, { spaces: 2 });
        log(`'${C.FINAL_SONG_DATA_FILE}' 파일 생성 완료.`);
        await fs.writeJson(C.STAGE_3_COMPLETE_FLAG, { completedAt: new Date() });
        log('3단계 성공적으로 완료.', 'success');
    } catch (error) {
        log(`3단계 실행 중 오류 발생: ${error.message}`, 'error');
        console.error(error);
        throw error;
    }
}

// --- 6. 메인 실행 함수 ---
async function main() {
    const args = process.argv.slice(2);
    const startFromArg = args.find(arg => arg.startsWith('--start-from='));
    let startStage = 1;
    if (startFromArg) startStage = parseInt(startFromArg.split('=')[1], 10);
    try {
        if (startStage <= 1) {
            if (await fs.exists(C.STAGE_1_COMPLETE_FLAG)) log('1단계는 이미 완료되어 건너뜁니다.', 'warn');
            else await runStage1_ScrapeData();
        }
        if (startStage <= 2) {
             if (await fs.exists(C.STAGE_2_COMPLETE_FLAG)) log('2단계는 이미 완료되어 건너뜁니다.', 'warn');
             else {
                if (!await fs.exists(C.CATEGORY_DATA_FILE)) throw new Error("1단계 결과 파일이 없어 2단계를 진행할 수 없습니다.");
                await runStage2_UpdateFromAPIs();
            }
        }
        if (startStage <= 3) {
            if (await fs.exists(C.STAGE_3_COMPLETE_FLAG)) log('3단계는 이미 완료되어 건너뜁니다.', 'warn');
            else {
                if (!await fs.exists(C.UPDATED_MUSIC_FILE)) throw new Error("2단계 결과 파일이 없어 3단계를 진행할 수 없습니다.");
                await runStage3_FinalizeData();
            }
        }
        log('최종화 단계 시작: 결과 파일 정리...');
        await fs.ensureDir(C.RESULTS_DIR);
        await fs.copy(C.FINAL_SONG_DATA_FILE, path.join(C.RESULTS_DIR, C.FINAL_SONG_DATA_FILE));
        await fs.copy(C.CATEGORY_DATA_FILE, path.join(C.RESULTS_DIR, C.CATEGORY_DATA_FILE));
        log(`결과물 폴더 '${C.RESULTS_DIR}'로 최종 파일들을 복사했습니다.`);
        const tempFiles = [ C.UPDATED_MUSIC_FILE, C.PREVIOUS_SONG_DATA_FILE, C.STAGE_1_COMPLETE_FLAG, C.STAGE_2_COMPLETE_FLAG, C.STAGE_3_COMPLETE_FLAG ];
        for (const file of tempFiles) {
            if (await fs.exists(file)) await fs.remove(file);
        }
        log('임시 파일들을 모두 삭제했습니다.');

        // segament_SongDataScript 폴더 내 chunithmSongData.json 파일을 chunithmSongData2.json으로 이름 변경
        const songDataPath = path.join(process.cwd(), 'chunithmSongData.json');
        const songData2Path = path.join(process.cwd(), 'chunithmSongData2.json');
        if (await fs.exists(songDataPath)) {
            await fs.rename(songDataPath, songData2Path);
            log(`'chunithmSongData.json' 파일을 'chunithmSongData2.json'으로 이름 변경했습니다.`);
        } else {
            log(`'chunithmSongData.json' 파일이 존재하지 않아 이름 변경을 건너뜁니다.`, 'warn');
        }

        log('🎉 모든 작업이 성공적으로 완료되었습니다!', 'success');
    } catch (error) {
        log(`\n스크립트 실행 중 치명적인 오류가 발생하여 중단되었습니다.`, 'error');
        log(`오류 메시지: ${error.message}`, 'error');
        log('오류를 수정한 후 스크립트를 다시 실행하면 실패한 단계부터 자동으로 재개됩니다.', 'info');
        process.exit(1);
    }
}

main();