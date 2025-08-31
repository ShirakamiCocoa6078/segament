"use client";
import React, { useEffect, useState } from "react";

export default function ChunithmRatingHistoryPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [selectWidth, setSelectWidth] = useState<number>(180); // 기본값
  const textMeasureRef = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (Array.isArray(data.profiles)) {
          setProfiles(data.profiles);
        } else {
          setProfiles([]);
        }
      } catch {
        setProfiles([]);
      }
    }
    fetchProfiles();
  }, []);

  const chunithmProfiles = profiles.filter(
    (p: any) => p.gameType === "CHUNITHM"
  );

  // 가장 긴 option 텍스트 계산
  useEffect(() => {
    let longest = "프로필이 존재하지 않습니다";
    if (chunithmProfiles.length > 0) {
      longest = chunithmProfiles
        .map((p: any) => `${p.playerName} - ${p.region}`)
        .reduce((a, b) => (a.length > b.length ? a : b), "");
    }
    if (textMeasureRef.current) {
      textMeasureRef.current.textContent = longest;
      const width = textMeasureRef.current.offsetWidth + 40; // padding 등 여유
      setSelectWidth(width);
    }
  }, [chunithmProfiles]);

  // 브라우저 크기 감지 및 그래프 크기 계산
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 그래프 비율 계산
  let graphHeight = Math.floor(windowSize.height / 3);
  let graphWidth = graphHeight * 3;
  // 모바일(가로 600 이하)일 때는 가로의 1/4, 세로는 가로의 1/4
  if (windowSize.width <= 600) {
    graphWidth = Math.floor(windowSize.width * 0.95);
    graphHeight = Math.floor(windowSize.width / 4);
  }

  // 그래프 영역 스타일
  const graphBoxStyle = {
    width: graphWidth,
    height: graphHeight,
    minWidth: 240,
    minHeight: 120,
    maxWidth: "100%",
    maxHeight: "100%"
  };

  return (
    <div className="w-full flex flex-col items-center mt-8">
      {/* 최상단: 큰 텍스트 */}
      <h1 className="text-3xl font-bold mb-6">레이팅 성장 그래프</h1>

      {/* 선택 박스 (가장 긴 텍스트에 맞춰 width 자동 조정) */}
      <div className="mb-4" style={{ width: selectWidth }}>
        <select
          className="w-full p-2 border rounded"
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
        >
          <option value="" disabled>
            프로필을 선택
          </option>
          {chunithmProfiles.length === 0 ? (
            <option value="" disabled>프로필이 존재하지 않습니다</option>
          ) : (
            chunithmProfiles.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.playerName} - {p.region}
              </option>
            ))
          )}
        </select>
        {/* 숨겨진 span으로 텍스트 길이 측정 */}
        <span
          ref={textMeasureRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            whiteSpace: "nowrap",
            fontSize: "1rem",
            fontWeight: "normal",
            padding: "8px"
          }}
        />
      </div>

  {/* 그래프 박스 및 관련 코드 완전 삭제됨 */}
    </div>
  );
}
