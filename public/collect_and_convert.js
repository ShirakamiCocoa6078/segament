import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

const SEGA_ID = process.env.SEGA_ID;
const SEGA_PASSWORD = process.env.SEGA_PASSWORD;
const BASE_URL = 'https://new.chunithm-net.com/chuni-mobile/html/mobile/record/';
const DATA_FILE = './jacket_data.json';
const BACKUP_FILE = './jacket-urls.json';

function randomWait(min = 1500, max = 2000) {
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, duration));
}

// 기존 데이터 로드 및 병합 함수 (파일 없거나 JSON 파싱 실패 시 안전하게 동작)
async function loadExistingData() {
    let jacketData = [];
    let jacketUrls = [];
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        jacketData = Array.isArray(parsed) ? parsed : [];
    } catch { jacketData = []; }
    try {
        const urls = await fs.readFile(BACKUP_FILE, 'utf-8');
        const parsedUrls = JSON.parse(urls);
        jacketUrls = Array.isArray(parsedUrls) ? parsedUrls : [];
    } catch { jacketUrls = []; }
    // idx 기준 중복 제거
    const jacketDataMap = new Map(jacketData.map(item => [item.idx, item]));
    const jacketUrlsMap = new Map(jacketUrls.map(item => [item.idx, item]));
    // jacket_data.json 우선, 없으면 jacket-urls.json에서 추가
    for (const [idx, item] of jacketUrlsMap.entries()) {
        if (!jacketDataMap.has(idx)) {
            jacketDataMap.set(idx, {
                idx: item.idx,
                title: item.title,
                jacketUrl: item.imageUrl
            });
        }
    }
    return {
        existingIds: new Set([...jacketDataMap.keys()]),
        existingData: Array.from(jacketDataMap.values())
    };
}

async function extractJacketUrl(page, musicIdx, musicTitle) {
    const selectors = [
        '.play_jacket_img img',
        '.jacket_img img',
        '.music_jacket img',
        '.jacket img',
        'img[src*="jacket"]',
        'img[src*=".jpg"]',
        'img[src*=".png"]'
    ];
    await page.waitForTimeout(1500);
    for (const selector of selectors) {
        const jacketElement = await page.locator(selector).first();
        if (await jacketElement.count() > 0) {
            let imageUrl = await jacketElement.getAttribute('src');
            if (imageUrl && (imageUrl.includes('.jpg') || imageUrl.includes('.png'))) {
                if (imageUrl.startsWith('/')) imageUrl = 'https://new.chunithm-net.com' + imageUrl;
                else if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
                return imageUrl;
            }
        }
    }
    return null;
}

async function main() {
    if (!SEGA_ID || !SEGA_PASSWORD) {
        console.error("❌ .env 파일에 SEGA_ID와 SEGA_PASSWORD를 설정해주세요.");
        return;
    }
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        extraHTTPHeaders: { 'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8' }
    });
    const page = await context.newPage();
    let newJacketData = [];
    let collectedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let musicElements = [];
    let existingIds = new Set();
    let existingData = [];
    try {
        // 기존 데이터 병합해서 로드
        const loaded = await loadExistingData();
        existingIds = loaded.existingIds;
        existingData = loaded.existingData;
        console.log(`[INFO] 기존 수집된 곡 수: ${existingIds.size}`);
        await page.goto('https://new.chunithm-net.com/');
        await page.locator('input[name="segaId"]').fill(SEGA_ID);
        await page.locator('input[name="password"]').fill(SEGA_PASSWORD);
        await page.locator('button.btn_login').click();
        await page.waitForURL('**/aimeList/');
        await page.locator('button.btn_select_aime').click();
        await page.waitForURL('**/home/');
        await randomWait();

        await page.goto(`${BASE_URL}musicGenre/`, { waitUntil: 'networkidle' });
        await page.locator(`.difficulty_btn_record[onclick*="'Basic'"]`).click();
        await page.waitForLoadState('networkidle');
        musicElements = await page.locator('.musiclist_box').all();
        console.log(`[INFO] 곡 목록 수집 완료. 총 ${musicElements.length}곡 발견.`);

        for (const [i, musicElement] of musicElements.entries()) {
            try {
                const idx = await musicElement.locator('input[name="idx"]').inputValue();
                const title = await musicElement.locator('.music_title').innerText();
                if (existingIds.has(idx)) {
                    console.log(`[SKIP] (${i+1}/${musicElements.length}) 이미 수집됨: ${title} (idx: ${idx})`);
                    skippedCount++;
                    continue;
                }
                console.log(`[TRY] (${i+1}/${musicElements.length}) 곡 처리 중: ${title} (idx: ${idx})`);
                const titleElement = musicElement.locator('.music_title');
                await titleElement.waitFor({ state: 'visible', timeout: 10000 });
                await Promise.all([
                    page.waitForLoadState('networkidle', { timeout: 30000 }),
                    titleElement.click()
                ]);
                const imageUrl = await extractJacketUrl(page, idx, title);
                if (imageUrl) {
                    newJacketData.push({ idx, title, jacketUrl: imageUrl });
                    collectedCount++;
                    console.log(`[OK] 자켓 수집 성공: ${title} (idx: ${idx})`);
                } else {
                    failedCount++;
                    console.log(`[FAIL] 자켓 수집 실패: ${title} (idx: ${idx})`);
                }
                await Promise.all([
                    page.waitForLoadState('networkidle', { timeout: 30000 }),
                    page.goBack()
                ]);
                await randomWait(800, 1200);
            } catch (err) {
                failedCount++;
                console.log(`[ERROR] 곡 처리 중 오류 발생: ${err.message}`);
                // 예외 발생 시, 기존+새 데이터 병합 후 저장
                try {
                    const mergedData = [...existingData, ...newJacketData];
                    // idx 기준 중복 제거
                    const uniqueData = mergedData.filter((item, idx, arr) =>
                        arr.findIndex(x => x.idx === item.idx) === idx
                    );
                    await fs.writeFile(DATA_FILE, JSON.stringify(uniqueData, null, 2));
                    await fs.writeFile(BACKUP_FILE, JSON.stringify(
                        uniqueData.map(item => ({
                            idx: item.idx,
                            title: item.title,
                            imageUrl: item.jacketUrl
                        })), null, 2));
                    console.log(`[SAVE] 예외 발생 시점까지 수집된 데이터 저장 완료!`);
                } catch (saveErr) {
                    console.log(`[ERROR] 예외 데이터 저장 실패: ${saveErr.message}`);
                }
                throw err;
            }
        }
        // 기존 데이터와 새 데이터 병합
        const mergedData = [...existingData, ...newJacketData];
        // idx 기준 중복 제거
        const uniqueData = mergedData.filter((item, idx, arr) =>
            arr.findIndex(x => x.idx === item.idx) === idx
        );
        await fs.writeFile(DATA_FILE, JSON.stringify(uniqueData, null, 2));
        await fs.writeFile(BACKUP_FILE, JSON.stringify(
            uniqueData.map(item => ({
                idx: item.idx,
                title: item.title,
                imageUrl: item.jacketUrl
            })), null, 2));
        console.log(`✅ jacket_data.json 병합 및 저장 완료!`);
        console.log(`[RESULT] 수집 성공: ${collectedCount}, 실패: ${failedCount}, 스킵: ${skippedCount}`);
    } catch (error) {
        console.error('💥 오류:', error);
    } finally {
        await browser.close();
    }
}

main();
