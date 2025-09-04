// src/app/[userId]/chunithm/calc/const/page.tsx
'use client';

import { useState } from 'react';

export default function ConstCalChuPage() {
  const [tab, setTab] = useState<'opUpdate' | 'opTotal'>('opUpdate');

  // OP갱신값 탭
  const [scoreUpdate, setScoreUpdate] = useState('');
  const [overPowerUpdate, setOverPowerUpdate] = useState('');
  const [comboUpdate, setComboUpdate] = useState('none');
  const [resultUpdate, setResultUpdate] = useState<string | null>(null);

  // OP전체값 탭
  const [beforeOP, setBeforeOP] = useState('');
  const [afterOP, setAfterOP] = useState('');
  const [scoreTotal, setScoreTotal] = useState('');
  const [comboTotal, setComboTotal] = useState('none');

  return (
  <div className="container p-8 max-w-md flex flex-col items-start">
  <h1 className="text-2xl font-bold mb-6 text-left">상수 계산기</h1>
  <div className="flex gap-2 mb-8 justify-start">
        <button
          type="button"
          className={`px-4 py-2 rounded font-semibold border ${tab === 'opUpdate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setTab('opUpdate')}
        >
          OP갱신값
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded font-semibold border ${tab === 'opTotal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setTab('opTotal')}
        >
          OP전체값
        </button>
      </div>

      {tab === 'opUpdate' && (
  <form className="space-y-6 text-left">
          <div>
            <label className="block mb-2 font-medium">달성 스코어</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={scoreUpdate}
              onChange={e => setScoreUpdate(e.target.value)}
              placeholder="예: 1007500, 991557"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">HOT OVER POWER +값 혹은 OVER POWER +값</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={overPowerUpdate}
              onChange={e => setOverPowerUpdate(e.target.value)}
              placeholder="예: 82.11, 83.22"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">콤보 타입</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={comboUpdate}
              onChange={e => setComboUpdate(e.target.value)}
            >
              <option value="none">없음</option>
              <option value="fc">Full Combo</option>
              <option value="aj">All Justice</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition"
              onClick={() => {
                // 입력값 파싱
                const score = Number(scoreUpdate);
                const op = Number(overPowerUpdate);
                let combo = comboUpdate;
                // 스코어가 1010000점이면 콤보 타입을 강제로 AJC로 간주
                if (score === 1010000) combo = 'ajc';

                // 1단계: 보정치1 결정
                let bonus1 = 0;
                if (combo === 'ajc') bonus1 = 1.25;
                else if (combo === 'aj') bonus1 = 1.0;
                else if (combo === 'fc') bonus1 = 0.5;
                // 없음은 0

                let result = '';
                // 2단계: 구간별 역산
                if (score >= 1010000) {
                  // A) 1010000점 이상 (AJC)
                  const constValue = (op / 5) - 3;
                  result = `보면 상수: ${Math.round(constValue * 10) / 10}`;
                } else if (score >= 1007501) {
                  // B) 1007501 ~ 1009999 (SSS 이상)
                  const bonus2 = (score - 1007500) * 0.0015;
                  const constValue = ((op - bonus1 - bonus2) / 5) - 2;
                  result = `보면 상수: ${Math.round(constValue * 10) / 10}`;
                } else if (score >= 975000) {
                  // C) 975000 ~ 1007500 (S ~ SSS)
                  const ratingValue = (op - bonus1) / 5;
                  // 소수점 2자리 버림
                  const ratingValueCut = Math.floor(ratingValue * 100) / 100;
                  let addRating = 0;
                  if (score >= 1007500) {
                    addRating = 2.0 + (score - 1007500) * 0.0001;
                  } else if (score >= 1005000) {
                    addRating = 1.5 + (score - 1005000) * 0.0002;
                  } else if (score >= 1000000) {
                    addRating = 1.0 + (score - 1000000) * 0.0001;
                  } else {
                    addRating = (score - 975000) * 0.00004;
                  }
                  const constValue = ratingValueCut - addRating;
                  result = `보면 상수: ${Math.round(constValue * 10) / 10}`;
                } else {
                  result = '지원하지 않는 스코어 구간입니다.';
                }
                setResultUpdate(result);
              }}
            >
              계산
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded font-semibold hover:bg-gray-400 transition"
              onClick={() => {
                setScoreUpdate('');
                setOverPowerUpdate('');
                setComboUpdate('none');
                setResultUpdate(null);
              }}
            >
              입력값 초기화
            </button>
          </div>
          {resultUpdate && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-left font-bold text-blue-700">
              {resultUpdate}
            </div>
          )}
        </form>
      )}

      {tab === 'opTotal' && (
        <form className="space-y-6 text-left">
          <div>
            <label className="block mb-2 font-medium">갱신전 OVER POWER</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={beforeOP}
              onChange={e => setBeforeOP(e.target.value)}
              placeholder="예: 1920.88"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">갱신후 OVER POWER</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={afterOP}
              onChange={e => setAfterOP(e.target.value)}
              placeholder="예: 2001.12"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">달성 스코어</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={scoreTotal}
              onChange={e => setScoreTotal(e.target.value)}
              placeholder="예: 1004567"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">콤보 타입</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={comboTotal}
              onChange={e => setComboTotal(e.target.value)}
            >
              <option value="none">없음</option>
              <option value="fc">Full Combo</option>
              <option value="aj">All Justice</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition"
              onClick={() => {
                // 갱신후 OP - 갱신전 OP = OP 갱신값
                const opUpdate = Number(afterOP) - Number(beforeOP);
                const score = Number(scoreTotal);
                let combo = comboTotal;
                if (score === 1010000) combo = 'ajc';
                let bonus1 = 0;
                if (combo === 'ajc') bonus1 = 1.25;
                else if (combo === 'aj') bonus1 = 1.0;
                else if (combo === 'fc') bonus1 = 0.5;
                let result = '';
                if (score >= 1010000) {
                  const constValue = (opUpdate / 5) - 3;
                  result = `보면 상수: ${Math.round(constValue * 10) / 10}`;
                } else if (score >= 1007501) {
                  const bonus2 = (score - 1007500) * 0.0015;
                  const constValue = ((opUpdate - bonus1 - bonus2) / 5) - 2;
                  result = `보면 상수: ${Math.round(constValue * 10) / 10}`;
                } else if (score >= 975000) {
                  const ratingValue = (opUpdate - bonus1) / 5;
                  const ratingValueCut = Math.floor(ratingValue * 100) / 100;
                  let addRating = 0;
                  if (score >= 1007500) {
                    addRating = 2.0 + (score - 1007500) * 0.0001;
                  } else if (score >= 1005000) {
                    addRating = 1.5 + (score - 1005000) * 0.0002;
                  } else if (score >= 1000000) {
                    addRating = 1.0 + (score - 1000000) * 0.0001;
                  } else {
                    addRating = (score - 975000) * 0.00004;
                  }
                  const constValue = ratingValueCut - addRating;
                  result = `보면 상수: ${Math.round(constValue * 10) / 10}`;
                } else {
                  result = '지원하지 않는 스코어 구간입니다.';
                }
                setResultUpdate(result);
              }}
            >
              계산
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded font-semibold hover:bg-gray-400 transition"
              onClick={() => {
                setBeforeOP('');
                setAfterOP('');
                setScoreTotal('');
                setComboTotal('none');
                setResultUpdate(null);
              }}
            >
              입력값 초기화
            </button>
          </div>
          {resultUpdate && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-left font-bold text-blue-700">
              {resultUpdate}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
