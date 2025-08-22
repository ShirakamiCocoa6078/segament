import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { existsSync, mkdirSync } from 'fs';

const JSON_FILE = 'jacket_data.json';
const OUTPUT_DIR = 'jacket';
const MAX_WORKERS = 5;

async function downloadImage(item) {
    const { idx, title, jacketUrl } = item;
    const filename = `${idx}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);
    if (existsSync(filepath)) {
        console.log(`이미 존재함: ${filename}`);
        return true;
    }
    try {
        const response = await axios.get(jacketUrl, { responseType: 'arraybuffer', timeout: 30000 });
        await fs.writeFile(filepath, response.data);
        console.log(`다운로드 완료: ${filename}`);
        return true;
    } catch (e) {
        console.log(`다운로드 실패 - idx: ${idx}, title: ${title}, 오류: ${e.message}`);
        return false;
    }
}

async function main() {
    if (!existsSync(JSON_FILE)) {
        console.log(`오류: ${JSON_FILE} 파일을 찾을 수 없습니다.`);
        return;
    }
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR);
    }
    const data = JSON.parse(await fs.readFile(JSON_FILE, 'utf-8'));
    console.log(`총 ${data.length}개의 이미지를 다운로드합니다.`);
    let successCount = 0, failedCount = 0, completed = 0;
    for (let i = 0; i < data.length; i += MAX_WORKERS) {
        const batch = data.slice(i, i + MAX_WORKERS);
        const results = await Promise.all(batch.map(downloadImage));
        results.forEach(result => {
            if (result) successCount++;
            else failedCount++;
            completed++;
        });
        if (completed % 100 === 0 || completed === data.length) {
            console.log(`진행률: ${completed}/${data.length} (${(completed/data.length*100).toFixed(1)}%) - 성공: ${successCount}, 실패: ${failedCount}`);
        }
    }
    console.log(`\n다운로드 완료! 성공: ${successCount}, 실패: ${failedCount}`);
}

main();
