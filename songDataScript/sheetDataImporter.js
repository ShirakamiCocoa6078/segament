// sheetDataImporter.js
// 스프레드시트에서 곡명, 난이도, oldVersion(XVRS), newVersion(XVRSX) 값을 읽어와 sheetData.json에 기록 (함수화)

import 'dotenv/config';
import fs from 'fs-extra';
import { google } from 'googleapis';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAMES_TO_FETCH = [ '15,15+', '14+', '14', '13.8～13.9', '13.5～13.7', '13', '12+', '12', '11+', '11以下' ];

const LOG_FILE = 'sheetData.json';

export async function extractSheetConstants() {
    const sheets = google.sheets({ version: 'v4', auth: GOOGLE_API_KEY });
    let result = {};
    for (const sheetName of SHEET_NAMES_TO_FETCH) {
        try {
            const response = await sheets.spreadsheets.values.get({ spreadsheetId: GOOGLE_SHEET_ID, range: sheetName });
            const rows = response.data.values;
            if (!rows || rows.length === 0) continue;
            // 3행 기준으로 곡명 열 인덱스 찾기
            const headerRowIdx = 2; // 0-indexed, 3행
            const maxCol = Math.max(...rows.map(r => r.length));
            let col = 0;
            while (col < maxCol) {
                const cellVal = (rows[headerRowIdx][col] || '').trim();
                if (cellVal.includes('色づけルール')) {
                    col++;
                    continue;
                }
                if (cellVal !== '曲名') {
                    col++;
                    continue;
                }
                // 헤더 기준: 곡명(A), 譜面(B), oldVersion(D), newVersion(E) 등
                const diffCol = col + 1;
                const oldCol = col + 3;
                const newCol = col + 4;
                let emptyColCount = 0;
                for (let r = headerRowIdx + 1; r < rows.length; r++) {
                    const title = (rows[r][col] || '').trim();
                    if (
                        title.includes('色づけルール') ||
                        title.includes('昇格:赤') ||
                        title.includes('降格:青') ||
                        title.includes('黄背景:') ||
                        title.includes('薄緑背景:')
                    ) continue;
                    const diffRaw = (rows[r][diffCol] || '').trim();
                    const diffMap = { 'BAS': 'BASIC', 'ADV': 'ADVANCED', 'EXP': 'EXPERT', 'MAS': 'MASTER', 'ULT': 'ULTIMA' };
                    const difficulty = diffMap[diffRaw] || diffRaw;
                    const oldVersion = (rows[r][oldCol] || '').trim();
                    const newVersion = (rows[r][newCol] || '').trim();
                    let oldConst = oldVersion === '' ? null : parseFloat(oldVersion);
                    let newConst = newVersion === '' ? null : parseFloat(newVersion);
                    if (title && difficulty) {
                        if (!result[title]) result[title] = {};
                        result[title][diffRaw] = {
                            oldVersion: oldConst === null || isNaN(oldConst) ? null : oldConst,
                            newVersion: newConst === null || isNaN(newConst) ? null : newConst
                        };
                        emptyColCount = 0;
                    } else {
                        emptyColCount++;
                        if (emptyColCount >= 6) {
                            break;
                        }
                        continue;
                    }
                }
                // 다음 곡명 열 찾기: 3행에서 다음 곡명 셀
                let nextCol = col + 1;
                let foundNext = false;
                while (nextCol < maxCol) {
                    const nextCell = (rows[headerRowIdx][nextCol] || '').trim();
                    if (nextCell.includes('色づけルール')) {
                        nextCol++;
                        continue;
                    }
                    if (nextCell === '曲名') {
                        col = nextCol;
                        foundNext = true;
                        break;
                    }
                    nextCol++;
                }
                if (!foundNext) {
                    break;
                }
            }
        } catch (error) {
            // 무시
        }
    }
    await fs.writeJson(LOG_FILE, result, { spaces: 2 });
    console.log(`로그가 ${LOG_FILE}에 저장되었습니다.`);
    return result;
}

// 단독 실행 시 (ESM 호환, OS 무관)
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
    extractSheetConstants();
}
